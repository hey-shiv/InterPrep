import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_BASE = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function chat(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(GROQ_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json() as any;
  return data.choices[0].message.content as string;
}

function cleanJson(text: string): string {
  return text.replaceAll("```json", "").replaceAll("```", "").trim();
}

function tryParse(v: any) {
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}

export const ai = new Hono()
  // Generate questions for interview
  .post("/questions", async (c) => {
    try {
      const { role, resumeData, sessionId } = await c.req.json();
      
      const resumeSummary = resumeData 
        ? `Candidate strengths: ${resumeData.strengths?.join(", ")}. Areas to probe: ${resumeData.areasToExplore?.join(", ")}. Landmines: ${resumeData.landmines?.join(", ")}.`
        : "No resume provided.";

      const text = await chat(
        "You are a senior technical interviewer. Generate interview questions. Return JSON only.",
        `Generate exactly 8 interview questions for a ${role || "software engineer"} candidate.
${resumeSummary}

Return JSON:
{
  "questions": [
    {
      "id": "q1",
      "text": "full question text",
      "type": "Technical|Behavioral|System Design|Coding|Resume",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Make questions progressively harder. Include: 2 warmup/behavioral, 3 technical/coding, 1 system design, 1 resume-specific, 1 curveball.`
      );
      const parsed = JSON.parse(cleanJson(text));
      return c.json({ questions: parsed.questions || [] }, 200);
    } catch (e: any) {
      // Return default questions on error
      return c.json({
        questions: [
          { id: "q1", text: "Tell me about yourself and what excites you about this role.", type: "Behavioral", difficulty: "easy" },
          { id: "q2", text: "Describe a challenging technical problem you solved recently.", type: "Behavioral", difficulty: "easy" },
          { id: "q3", text: "How would you design a cache invalidation strategy for a distributed system?", type: "Technical", difficulty: "medium" },
          { id: "q4", text: "Explain the difference between concurrency and parallelism with examples.", type: "Technical", difficulty: "medium" },
          { id: "q5", text: "Design a notification system that handles 10M users.", type: "System Design", difficulty: "hard" },
          { id: "q6", text: "Walk me through the most complex piece of code you've written.", type: "Resume", difficulty: "medium" },
          { id: "q7", text: "Find the first non-repeating character in a string. What's your optimal approach?", type: "Coding", difficulty: "medium" },
          { id: "q8", text: "If you could redo your last project from scratch, what would you change and why?", type: "Behavioral", difficulty: "medium" },
        ]
      }, 200);
    }
  })

  // Analyze full interview session
  .post("/analyze", async (c) => {
    try {
      const { answers, questions, sessionId } = await c.req.json();
      
      if (!sessionId) return c.json({ error: "No session ID" }, 400);

      // Build scored questions
      const scoredQuestions = [];
      for (const q of (questions || [])) {
        const answer = answers?.[q.id] || "";
        let score = { accuracy: 5, clarity: 5, confidence: 5, depth: 5, overall: 5, note: "" };
        
        try {
          const scoreText = await chat(
            "You are an interviewer scoring interview answers. Return JSON only.",
            `Question: "${q.text}" (${q.type})
Answer: "${answer.slice(0, 500)}"

Score this answer out of 10 each:
{
  "accuracy": 7.0,
  "clarity": 6.5,
  "confidence": 7.5,
  "depth": 6.0,
  "overall": 6.8,
  "note": "1-2 candid sentences about what was missing or strong",
  "idealAnswer": "2-3 sentences on what the ideal answer covers"
}`
          );
          score = JSON.parse(cleanJson(scoreText));
        } catch {}

        scoredQuestions.push({
          id: q.id,
          question: q.text,
          type: q.type,
          answer,
          idealAnswer: (score as any).idealAnswer || "",
          accuracy: (score as any).accuracy || 5,
          clarity: (score as any).clarity || 5,
          confidence: (score as any).confidence || 5,
          depth: (score as any).depth || 5,
          score: (score as any).overall || 5,
          note: (score as any).note || "",
        });
      }

      // Calculate overall metrics
      const avg = scoredQuestions.length > 0
        ? scoredQuestions.reduce((sum, q) => sum + q.score, 0) / scoredQuestions.length
        : 5;
      
      const verdict = avg >= 7.5 ? "HIRE" : avg >= 5.5 ? "BORDERLINE" : "NO HIRE";

      // Generate debrief
      let debrief = `You averaged ${avg.toFixed(1)}/10 across ${scoredQuestions.length} questions.`;
      let shadowQuestions: any[] = [];
      let improvementPlan: any[] = [];
      let verdictQuote = "You sounded most confident on the question you answered least accurately.";

      try {
        const debriefText = await chat(
          "You are a senior technical interviewer writing a post-interview debrief. Be direct and honest. Return JSON only.",
          `Overall score: ${avg.toFixed(1)}/10. Verdict: ${verdict}.
Questions: ${JSON.stringify(scoredQuestions.map(q => ({ q: q.question.slice(0, 100), score: q.score, note: q.note })))}

Return JSON:
{
  "debrief": "3-4 honest sentences about overall performance",
  "verdictQuote": "One memorable, shareable sentence capturing the essence of this candidate's result",
  "shadowQuestions": [
    { "question": "Q we wanted to ask", "why": "why it matters", "howToPrepare": "how to prepare" }
  ],
  "improvementPlan": [
    { "title": "what to fix", "instructions": "specific practice method", "timeline": "2 weeks" }
  ]
}`
        );
        const debriefData = JSON.parse(cleanJson(debriefText));
        debrief = debriefData.debrief || debrief;
        verdictQuote = debriefData.verdictQuote || verdictQuote;
        shadowQuestions = debriefData.shadowQuestions || [];
        improvementPlan = debriefData.improvementPlan || [];
      } catch {}

      // Save to DB
      const metricsObj = {
        overall: parseFloat(avg.toFixed(1)),
        confidence: parseFloat((scoredQuestions.reduce((s, q) => s + q.confidence, 0) / (scoredQuestions.length || 1)).toFixed(1)),
        stress: 0.42,
        bestMoment: `Q${scoredQuestions.reduce((best, q, i) => q.score > scoredQuestions[best].score ? i : best, 0) + 1}`,
        totalQuestions: scoredQuestions.length,
      };

      try {
        await db.update(schema.sessions).set({
          verdict,
          questions: JSON.stringify(scoredQuestions),
          metrics: JSON.stringify(metricsObj),
          shadowQuestions: JSON.stringify(shadowQuestions),
          improvementPlan: JSON.stringify(improvementPlan),
          status: "complete",
          completedAt: new Date(),
        }).where(eq(schema.sessions.id, sessionId));
      } catch {}

      return c.json({
        verdict,
        score: avg,
        debrief,
        verdictQuote,
        metrics: metricsObj,
        questions: scoredQuestions,
        shadowQuestions,
        improvementPlan,
      }, 200);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  })

  // Analyze resume (legacy endpoint)
  .post("/analyze-resume", async (c) => {
    try {
      const { resumeText, roleId } = await c.req.json();
      const text = await chat(
        "You are a strict senior technical interviewer. Analyze resumes. Return JSON only.",
        `Analyze this resume for a ${roleId} position:\n\n${resumeText}\n\nReturn JSON with fields: name, experience_level, top_skills, strengths, areasToExplore, landmines, summary`
      );
      return c.json({ data: JSON.parse(cleanJson(text)) }, 200);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  })

  // Generate questions (legacy)
  .post("/generate-questions", async (c) => {
    try {
      const { roleId, resumeAnalysis } = await c.req.json();
      const text = await chat(
        "You are a senior interviewer. Generate interview questions. Return JSON only.",
        `Generate 8 questions for ${roleId}. Return: { "questions": [...] }`
      );
      const parsed = JSON.parse(cleanJson(text));
      return c.json({ data: parsed.questions || [] }, 200);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  })

  // Score answer
  .post("/score-answer", async (c) => {
    try {
      const { question, metrics } = await c.req.json();
      const text = await chat(
        "You are a senior interviewer scoring interview answers. Return JSON only.",
        `Q: "${question.questionText}"\nAnswer: "${metrics.transcript}"\n\nReturn: { "accuracy": 7, "clarity": 7, "confidence": 7, "depth": 7, "overall": 7, "interviewerNote": "..." }`
      );
      return c.json({ data: JSON.parse(cleanJson(text)) }, 200);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  })

  // Generate verdict
  .post("/generate-verdict", async (c) => {
    try {
      const { roleId, resumeAnalysis, metrics } = await c.req.json();
      const avg = metrics.length ? metrics.reduce((a: number, m: any) => a + (m.score?.overall ?? 5), 0) / metrics.length : 5;
      const verdict = avg >= 7.5 ? "HIRE" : avg >= 5.5 ? "BORDERLINE" : "NO_HIRE";
      return c.json({ data: { decision: verdict, overallScore: avg } }, 200);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
