import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export const sessions = new Hono()
  // GET all sessions
  .get("/", async (c) => {
    try {
      const all = await db.select().from(schema.sessions).orderBy(desc(schema.sessions.createdAt));
      // Parse JSON fields
      const parsed = all.map((s: any) => ({
        ...s,
        resumeAnalysis: s.resumeAnalysis ? tryParse(s.resumeAnalysis) : null,
        questions: s.questions ? tryParse(s.questions) : [],
        metrics: s.metrics ? tryParse(s.metrics) : {},
        verdict: s.verdict,
        shadowQuestions: s.shadowQuestions ? tryParse(s.shadowQuestions) : [],
        improvementPlan: s.improvementPlan ? tryParse(s.improvementPlan) : [],
        jobRole: s.roleTitle,
      }));
      return c.json({ sessions: parsed }, 200);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  })

  // POST create new session
  .post("/", async (c) => {
    try {
      const body = await c.req.json();
      const id = randomUUID();
      const roleId = body.jobRole || body.roleId || "software-engineer";
      const roleTitle = body.jobRole || body.roleTitle || roleId;
      const [session] = await db.insert(schema.sessions).values({
        id,
        roleId,
        roleTitle,
        candidateName: body.candidateName,
        resumeAnalysis: body.resumeAnalysis ? JSON.stringify(body.resumeAnalysis) : null,
        status: "setup",
      }).returning();
      return c.json({ session: { ...session, id } }, 201);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  })

  // POST parse-resume (file upload)
  .post("/parse-resume", async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("resume") as File | null;
      const role = formData.get("role") as string || "software-engineer";

      if (!file) return c.json({ error: "No file provided" }, 400);

      // Convert PDF to text using pdf-parse
      const buffer = await file.arrayBuffer();
      let resumeText = "";
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        try {
          const pdfData = await parser.getText();
          resumeText = pdfData.text;
        } finally {
          await parser.destroy();
        }
      } catch {
        resumeText = "Resume text extraction failed. Proceeding with basic analysis.";
      }

      // Call Groq to analyze
      const GROQ_KEY = process.env.GROQ_API_KEY || "";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
          messages: [
            { role: "system", content: "You are a strict senior technical interviewer. Analyze resumes. Return JSON only." },
            { role: "user", content: `Analyze this resume for a ${role} position:\n\n${resumeText.slice(0, 3000)}\n\nReturn JSON:\n{\n  "name": "candidate name or Unknown",\n  "experience_level": "fresher|junior|mid|senior",\n  "top_skills": ["skill1", "skill2", "skill3"],\n  "strengths": ["strength1", "strength2", "strength3"],\n  "areasToExplore": ["area1", "area2", "area3"],\n  "landmines": ["gap1", "gap2"],\n  "summary": "2-3 sentence honest assessment"\n}` },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        // Return mock data if Groq fails
        return c.json({
          name: "Candidate",
          top_skills: ["Problem Solving", "Communication", "Technical Skills"],
          strengths: ["Relevant experience", "Strong fundamentals", "Project history"],
          areasToExplore: ["Scalability experience", "Leadership examples", "Quantified impact"],
          landmines: ["Vague claims about scale", "Gap in leadership"],
          summary: "Candidate shows potential. Several claims need verification.",
        }, 200);
      }

      const data = await res.json() as any;
      const parsed = JSON.parse(data.choices[0].message.content);
      return c.json(parsed, 200);
    } catch (e: any) {
      // Return mock data on any error
      return c.json({
        name: "Candidate",
        top_skills: ["Problem Solving", "Communication", "Technical Skills"],
        strengths: ["Relevant experience", "Strong fundamentals", "Good project history"],
        areasToExplore: ["Scalability depth", "Leadership examples", "Quantified metrics"],
        landmines: ["Vague scale claims"],
        summary: "Resume parsed. Interview will explore key areas.",
      }, 200);
    }
  })

  // GET single session
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const [session] = await db.select().from(schema.sessions).where(eq(schema.sessions.id, id));
      if (!session) return c.json({ error: "Not found" }, 404);
      const s = session as any;
      return c.json({
        session: {
          ...s,
          jobRole: s.roleTitle,
          resumeAnalysis: s.resumeAnalysis ? tryParse(s.resumeAnalysis) : null,
          questions: s.questions ? tryParse(s.questions) : [],
          metrics: s.metrics ? tryParse(s.metrics) : {},
          shadowQuestions: s.shadowQuestions ? tryParse(s.shadowQuestions) : [],
          improvementPlan: s.improvementPlan ? tryParse(s.improvementPlan) : [],
        }
      }, 200);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  })

  // PATCH update session
  .patch("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const update: Record<string, any> = {};
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === "object" && v !== null && !Array.isArray(v)) {
          update[k] = JSON.stringify(v);
        } else if (Array.isArray(v)) {
          update[k] = JSON.stringify(v);
        } else {
          update[k] = v;
        }
      }
      if (body.status === "complete") update.completedAt = new Date();
      const [session] = await db.update(schema.sessions).set(update).where(eq(schema.sessions.id, id)).returning();
      return c.json({ session }, 200);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

function tryParse(v: any) {
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}
