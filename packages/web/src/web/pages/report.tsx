import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'wouter'
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Download, RefreshCcw, Target, TrendingUp } from 'lucide-react'
import { Brand, StageNav } from '../components/brand'

type Verdict = 'HIRE' | 'BORDERLINE' | 'NO HIRE'

type QuestionResult = {
  id: string
  question: string
  type: string
  answer: string
  idealAnswer?: string
  accuracy: number
  clarity: number
  confidence: number
  depth: number
  score: number
  note?: string
}

type ReportData = {
  verdict: Verdict
  score: number
  debrief: string
  metrics: {
    totalQuestions: number
    avgConfidence: number
    peakStress: number
    bestMoment: string
  }
  questions: QuestionResult[]
  shadowQuestions: { question: string; why: string; howToPrepare: string }[]
  improvementPlan: { title: string; instructions: string; timeline: string }[]
  verdictQuote: string
}

const verdictStyle: Record<Verdict, { color: string; bg: string; label: string }> = {
  HIRE: { color: '#38e8b0', bg: 'rgba(56,232,176,0.12)', label: 'Ready for stronger loops' },
  BORDERLINE: { color: '#ffb545', bg: 'rgba(255,181,69,0.12)', label: 'Close, but needs sharper proof' },
  'NO HIRE': { color: '#ff5c7a', bg: 'rgba(255,92,122,0.12)', label: 'Needs focused repair before retry' },
}

export default function Report() {
  const [, setLocation] = useLocation()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const search = new URLSearchParams(window.location.search)
      const requestedId = search.get('id')
      const currentId = requestedId || sessionStorage.getItem('sessionId')

      if (!requestedId) {
        const cached = sessionStorage.getItem('reportData')
        if (cached) {
          try {
            setReport(normalizeReport(JSON.parse(cached)))
            setLoading(false)
            return
          } catch {}
        }
      }

      if (!currentId) {
        setReport(mockReport())
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/sessions/${currentId}`)
        const data = await res.json()
        const session = data.session
        if (!session) throw new Error('Missing session')
        setReport(normalizeReport({
          verdict: session.verdict || 'BORDERLINE',
          score: session.metrics?.overall || 6.8,
          metrics: {
            totalQuestions: session.questions?.length || 0,
            avgConfidence: session.metrics?.confidence || 6,
            peakStress: session.metrics?.stress || 0.42,
            bestMoment: session.metrics?.bestMoment || 'Q1',
          },
          questions: session.questions || [],
          shadowQuestions: session.shadowQuestions || [],
          improvementPlan: session.improvementPlan || [],
          debrief: 'Review the breakdown below. Focus first on low-score answers and any answer where confidence outran accuracy.',
          verdictQuote: 'The strongest candidates make their reasoning easy to follow.',
        }))
      } catch {
        setReport(mockReport())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="app-page grid min-h-screen place-items-center">
        <div className="panel p-8 text-center">
          <div className="mx-auto mb-4 flex justify-center gap-2">
            {[0, 1, 2].map(i => <span key={i} className="status-dot ok pulse-dot" style={{ animationDelay: `${i * 120}ms` }} />)}
          </div>
          <p className="text-xl font-bold text-t1">Building report...</p>
          <p className="body mt-1">Scoring questions and assembling next steps.</p>
        </div>
      </div>
    )
  }

  if (!report) return null

  const style = verdictStyle[report.verdict]
  const questions = report.questions.length ? report.questions : mockQuestions()

  return (
    <div className="app-page">
      <header className="app-topbar">
        <div className="app-nav">
          <Brand />
          <StageNav active={3} />
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost" onClick={() => setLocation('/')}>
              <ArrowLeft size={17} /> Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => setLocation('/setup')}>
              New Interview <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="summary" className="app-container grid items-start gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel p-7">
            <p className="eyebrow">Final verdict</p>
            <div className="mt-5 inline-flex rounded-[8px] border px-5 py-3" style={{ borderColor: style.color, background: style.bg }}>
              <span className="text-5xl font-extrabold" style={{ color: style.color }}>{report.verdict}</span>
            </div>
            <h1 className="page-title mt-6">{style.label}</h1>
            <p className="body-lg mt-3">{report.debrief}</p>
            <blockquote className="mt-6 rounded-[8px] border border-border-sub bg-bg1 p-5 text-xl font-semibold text-t1">
              “{report.verdictQuote}”
            </blockquote>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <Metric label="Overall" value={`${report.score.toFixed(1)}/10`} tone="text-success" />
              <Metric label="Questions" value={String(report.metrics.totalQuestions || questions.length)} />
              <Metric label="Confidence" value={`${report.metrics.avgConfidence.toFixed(1)}`} tone="text-accent" />
              <Metric label="Stress" value={`${Math.round(report.metrics.peakStress * 100)}%`} tone="text-warning" />
            </div>
            <div className="panel p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Confidence vs accuracy</p>
                  <h2 className="text-2xl font-bold text-t1">Where delivery matched substance</h2>
                </div>
                <BarChart3 className="text-success" />
              </div>
              <Scatter questions={questions} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="app-container grid gap-4 md:grid-cols-3">
            <Insight icon={Target} title="Best moment" value={report.metrics.bestMoment || 'Q1'} copy="Use this answer as your style reference." />
            <Insight icon={TrendingUp} title="Primary fix" value="Structure" copy="Lead with the answer, then justify with tradeoffs." />
            <Insight icon={CheckCircle2} title="Next session" value="Replay weak Qs" copy="Practice the bottom two answers out loud." />
          </div>
        </section>

        <section id="questions" className="section">
          <div className="app-container">
            <div className="mb-8">
              <p className="eyebrow">Question breakdown</p>
              <h2 className="section-title mt-2">Every answer, scored clearly.</h2>
            </div>
            <div className="grid gap-4">
              {questions.map((question, index) => <QuestionCard key={question.id || index} question={question} index={index} />)}
            </div>
          </div>
        </section>

        <section id="plan" className="section">
          <div className="app-container grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="eyebrow">Shadow questions</p>
              <h2 className="section-title mt-2">Questions to prepare next.</h2>
              <div className="mt-6 grid gap-3">
                {(report.shadowQuestions.length ? report.shadowQuestions : mockShadow()).map((item, index) => (
                  <div key={index} className="panel p-5">
                    <p className="font-bold text-t1">{item.question}</p>
                    <p className="body mt-2">{item.why}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow">Improvement plan</p>
              <h2 className="section-title mt-2">What to fix first.</h2>
              <div className="mt-6 grid gap-3">
                {(report.improvementPlan.length ? report.improvementPlan : mockPlan()).map((item, index) => (
                  <div key={index} className="panel p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-bold text-t1">{index + 1}. {item.title}</p>
                      <span className="chip">{item.timeline}</span>
                    </div>
                    <p className="body">{item.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="app-container panel grid gap-6 p-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-t1">Run another round after practicing the plan.</h2>
              <p className="body mt-1">The next session will make progress obvious.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-secondary"><Download size={16} /> Export PDF</button>
              <button className="btn btn-primary" onClick={() => setLocation('/setup')}>Start Again <ArrowRight size={16} /></button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function Metric({ label, value, tone = 'text-t1' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="metric">
      <p className={`metric-value ${tone}`}>{value}</p>
      <p className="metric-label">{label}</p>
    </div>
  )
}

function Insight({ icon: Icon, title, value, copy }: { icon: any; title: string; value: string; copy: string }) {
  return (
    <div className="panel p-5">
      <Icon size={22} className="text-success" />
      <p className="mt-5 metric-label">{title}</p>
      <p className="mt-1 text-2xl font-bold text-t1">{value}</p>
      <p className="body mt-2">{copy}</p>
    </div>
  )
}

function Scatter({ questions }: { questions: QuestionResult[] }) {
  return (
    <div className="relative h-80 rounded-[8px] border border-border-sub bg-bg0">
      <div className="absolute inset-8 border-l border-b border-border" />
      <div className="absolute left-8 right-8 top-8 bottom-8">
        {questions.map((q, index) => {
          const x = Math.max(4, Math.min(96, (q.confidence || 5) * 10))
          const y = Math.max(4, Math.min(96, 100 - (q.accuracy || 5) * 10))
          const danger = (q.confidence || 0) > 6 && (q.accuracy || 0) < 6
          return (
            <span
              key={q.id || index}
              className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[8px] font-mono text-xs font-bold"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                color: danger ? '#090b0f' : '#f6f2ea',
                background: danger ? '#ffb545' : q.score > 7 ? '#38e8b0' : '#7c5cff',
              }}
            >
              Q{index + 1}
            </span>
          )
        })}
      </div>
      <span className="absolute bottom-2 left-10 metric-label">Confidence</span>
      <span className="absolute left-2 top-10 metric-label">Accuracy</span>
    </div>
  )
}

function QuestionCard({ question, index }: { question: QuestionResult; index: number }) {
  const scoreTone = question.score >= 7 ? 'text-success' : question.score >= 5 ? 'text-warning' : 'text-danger'
  return (
    <article className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="chip">Q{index + 1}</span>
          <span className="chip">{question.type || 'Question'}</span>
        </div>
        <span className={`font-mono text-2xl ${scoreTone}`}>{(question.score || 0).toFixed(1)}/10</span>
      </div>
      <h3 className="text-xl font-bold text-t1">{question.question}</h3>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="panel-soft p-4">
          <p className="eyebrow">Your answer</p>
          <p className="body mt-2">{question.answer || 'No answer recorded.'}</p>
        </div>
        <div className="panel-soft p-4">
          <p className="eyebrow">Expected direction</p>
          <p className="body mt-2">{question.idealAnswer || 'A clear answer with tradeoffs, examples, and measured impact.'}</p>
        </div>
      </div>
      {question.note && <p className="body mt-4 text-warning">{question.note}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <MiniScore label="Accuracy" value={question.accuracy} />
        <MiniScore label="Clarity" value={question.clarity} />
        <MiniScore label="Confidence" value={question.confidence} />
        <MiniScore label="Depth" value={question.depth} />
      </div>
    </article>
  )
}

function MiniScore({ label, value }: { label: string; value: number }) {
  const score = value || 0
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="metric-label">{label}</span>
        <span className="font-mono text-sm text-t1">{score.toFixed(1)}</span>
      </div>
      <div className="bar mt-2"><span style={{ width: `${score * 10}%` }} /></div>
    </div>
  )
}

function normalizeReport(raw: Partial<ReportData>): ReportData {
  return {
    verdict: raw.verdict || 'BORDERLINE',
    score: Number(raw.score || 6.8),
    debrief: raw.debrief || 'You completed the interview. Use this report to focus your next practice session.',
    metrics: {
      totalQuestions: Number(raw.metrics?.totalQuestions || raw.questions?.length || 0),
      avgConfidence: Number(raw.metrics?.avgConfidence || 6.4),
      peakStress: Number(raw.metrics?.peakStress || 0.44),
      bestMoment: raw.metrics?.bestMoment || 'Q1',
    },
    questions: raw.questions || [],
    shadowQuestions: raw.shadowQuestions || [],
    improvementPlan: raw.improvementPlan || [],
    verdictQuote: raw.verdictQuote || 'Strong answers make the reasoning easy to follow.',
  }
}

function mockReport(): ReportData {
  return normalizeReport({
    verdict: 'BORDERLINE',
    score: 7.1,
    questions: mockQuestions(),
    shadowQuestions: mockShadow(),
    improvementPlan: mockPlan(),
    debrief: 'You had solid instincts, but several answers needed clearer numbers and tighter tradeoff language.',
  })
}

function mockQuestions(): QuestionResult[] {
  return [
    { id: 'q1', question: 'Tell me about a production issue you debugged under pressure.', type: 'Behavioral', answer: 'I started by isolating recent deploys, checking logs, and building a rollback plan.', idealAnswer: 'A STAR answer with detection, triage, mitigation, impact, and prevention.', accuracy: 7.4, clarity: 7.8, confidence: 7.1, depth: 6.8, score: 7.3, note: 'Good sequence. Add specific impact numbers.' },
    { id: 'q2', question: 'Design a URL shortener at 100M requests per day.', type: 'System Design', answer: 'I would use a cache, a database, and load balancing.', idealAnswer: 'Cover API design, ID generation, collision handling, storage, caching, analytics, and abuse controls.', accuracy: 5.5, clarity: 6.4, confidence: 8.2, depth: 5.2, score: 6.1, note: 'Confident but too shallow for scale.' },
    { id: 'q3', question: 'How would you optimize a slow database query?', type: 'Technical', answer: 'Run EXPLAIN, inspect indexes, rewrite joins, and validate with production-like data.', idealAnswer: 'Include plan analysis, indexes, query shape, connection pools, and rollout safety.', accuracy: 8.1, clarity: 8.4, confidence: 7.5, depth: 7.8, score: 8.0 },
  ]
}

function mockShadow() {
  return [
    { question: 'What metric proves your biggest project mattered?', why: 'Your answers need stronger evidence.', howToPrepare: 'Prepare impact numbers for your top three projects.' },
    { question: 'What tradeoff would you reverse now?', why: 'Interviewers test judgment, not just implementation.', howToPrepare: 'Pick one decision and explain the cost.' },
  ]
}

function mockPlan() {
  return [
    { title: 'Add numbers to every story', instructions: 'Rewrite your five most common answers with user count, latency, revenue, or time saved.', timeline: '3 days' },
    { title: 'Practice one system design deeply', instructions: 'Prepare a 2-minute, 8-minute, and 20-minute version of the same design.', timeline: '1 week' },
    { title: 'Slow down the first sentence', instructions: 'Start answers with the conclusion, pause, then explain the reasoning.', timeline: '2 weeks' },
  ]
}
