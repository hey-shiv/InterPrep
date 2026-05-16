import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'wouter'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, ScatterChart, Scatter, ReferenceLine
} from 'recharts'
import { Download, FileText, Video, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { GlowButton } from '../components/ui/GlowButton'
import { PhaseLabel } from '../components/ui/PhaseLabel'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { EmotionOrb } from '../components/ui/EmotionOrb'
import { DifferentiatorBox } from '../components/ui/DifferentiatorBox'
import { SectionBadge } from '../components/ui/SectionBadge'
import { AILoadingCard } from '../components/ui/AILoadingCard'
import { verdictBadge, staggerContainer, revealVariants } from '../../lib/motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'

// ── Types ──────────────────────────────────────────────────────────────────────

interface QuestionResult {
  id: string; question: string; type: string; answer: string; idealAnswer?: string
  accuracy: number; clarity: number; confidence: number; depth: number; score: number
  note?: string; emotion?: string
}

interface ReportData {
  verdict: 'HIRE' | 'BORDERLINE' | 'NO HIRE'
  score: number; debrief: string
  metrics: { totalQuestions: number; avgConfidence: number; peakStress: number; bestMoment: string }
  questions: QuestionResult[]
  shadowQuestions: { question: string; why: string; howToPrepare: string }[]
  improvementPlan: { title: string; instructions: string; timeline: string }[]
  heatmapData: number[]
  voiceData: { time: number; pitch: number; baseline: number }[]
  verdictQuote: string
}

const VERDICT_STYLES = {
  'HIRE': { border: '#22C55E', bg: 'rgba(34,197,94,0.08)', text: '#22C55E', shadow: '0 0 40px -8px rgba(34,197,94,0.4)' },
  'BORDERLINE': { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)', text: '#F59E0B', shadow: '0 0 40px -8px rgba(245,158,11,0.4)' },
  'NO HIRE': { border: '#EF4444', bg: 'rgba(239,68,68,0.08)', text: '#EF4444', shadow: '0 0 40px -8px rgba(239,68,68,0.4)' },
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, controls } = useScrollReveal()
  return (
    <motion.div ref={ref} animate={controls} initial="hidden" variants={revealVariants} className={className}>
      {children}
    </motion.div>
  )
}

// ── Heatmap ────────────────────────────────────────────────────────────────────

function NervousnessHeatmap({ data }: { data: number[] }) {
  const { ref, controls, inView } = useScrollReveal()
  // useMemo prevents Math.random() from re-running on every render
  const barData = useMemo(() => data.length > 0 ? data : generateMockHeatmap(), [data])
  const stats = useMemo(() => {
    const avg = barData.reduce((a, b) => a + b, 0) / barData.length
    const peakIdx = barData.reduce((best, v, i) => v > barData[best] ? i : best, 0)
    const calmIdx = barData.reduce((best, v, i) => v < barData[best] ? i : best, 0)
    const toTime = (idx: number) => {
      const sec = Math.round((idx / barData.length) * 600)
      return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
    }
    return { avg: avg.toFixed(2), peakTime: toTime(peakIdx), calmTime: toTime(calmIdx) }
  }, [barData])

  return (
    <div ref={ref}>
      <div className="h-20 bg-bg3 border border-border overflow-hidden relative flex items-end" style={{ borderRadius: 2 }}>
        {barData.map((val, i) => {
          const color = val > 0.6 ? 'rgba(239,68,68,0.85)' : val > 0.3 ? 'rgba(245,158,11,0.60)' : 'rgba(92,79,255,0.20)'
          return (
            <motion.div
              key={i} className="flex-1 min-w-0"
              style={{ backgroundColor: color }}
              animate={inView ? { height: `${Math.max(4, val * 100)}%` } : { height: '4px' }}
              transition={{ delay: i * 0.002, duration: 0.4, ease: 'easeOut' }}
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-2 px-1">
        {['0:00', '2:00', '4:00', '6:00', '8:00', '10:00'].map(t => (
          <span key={t} className="font-mono text-mono-sm text-t4">{t}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {[
          `Peak stress @ ${stats.peakTime}`,
          `Calmest @ ${stats.calmTime}`,
          `Avg Stress: ${stats.avg}`,
        ].map(s => (
          <span key={s} className="bg-bg3 border border-border px-4 py-2 font-mono text-mono-sm text-t2" style={{ borderRadius: 2 }}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function generateMockHeatmap(): number[] {
  return Array.from({ length: 200 }, (_, i) =>
    Math.max(0.05, Math.min(1, 0.3 + Math.sin(i * 0.08) * 0.3 + Math.random() * 0.2))
  )
}

// ── Voice chart ────────────────────────────────────────────────────────────────

function VoiceChart({ data }: { data: { time: number; pitch: number; baseline: number }[] }) {
  const chartData = data.length > 0 ? data : generateMockVoiceData()
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-bg3 border border-border p-3 text-mono-sm font-mono text-t2" style={{ borderRadius: 2 }}>
        <p>{payload[0]?.value?.toFixed(0)}Hz (interview)</p>
        <p className="text-t3">{payload[1]?.value?.toFixed(0)}Hz (baseline)</p>
      </div>
    )
  }
  return (
    <div className="bg-bg2 border border-border p-6" style={{ borderRadius: 2 }}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#1e1e1e" strokeDasharray="4 4" />
          <XAxis dataKey="time" tickFormatter={v => `${v}m`} tick={{ fill: '#5a5650', fontSize: 11, fontFamily: 'DM Mono' }} />
          <YAxis tick={{ fill: '#5a5650', fontSize: 11, fontFamily: 'DM Mono' }} />
          <RechartTooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="baseline" stroke="#5a5650" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="pitch" stroke="#5c4fff" strokeWidth={2} dot={{ fill: '#5c4fff', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function generateMockVoiceData() {
  return Array.from({ length: 10 }, (_, i) => ({ time: i + 1, baseline: 142, pitch: 140 + Math.sin(i * 0.6) * 20 + Math.random() * 15 }))
}

// ── Confidence vs Accuracy ────────────────────────────────────────────────────

function ConfidenceAccuracyChart({ questions }: { questions: QuestionResult[] }) {
  const data = questions.length > 0
    ? questions.map((q, i) => ({ x: q.confidence, y: q.accuracy, name: `Q${i + 1}`, id: q.id }))
    : Array.from({ length: 8 }, (_, i) => ({ x: 3 + Math.random() * 7, y: 3 + Math.random() * 7, name: `Q${i + 1}`, id: `q${i}` }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    if (!d) return null
    const zone = d.x > 5 && d.y < 5 ? 'DANGER ZONE' : d.x > 5 && d.y > 5 ? 'RIGHT + CONFIDENT' : d.x < 5 && d.y > 5 ? 'RIGHT BUT UNSURE' : 'WRONG + UNSURE'
    return (
      <div className="bg-bg3 border border-border p-3 text-mono-sm font-mono text-t2" style={{ borderRadius: 2 }}>
        <p>{d.name} · C: {d.x.toFixed(1)} · A: {d.y.toFixed(1)}</p>
        <p className={zone === 'DANGER ZONE' ? 'text-danger' : 'text-t3'}>{zone}</p>
      </div>
    )
  }

  return (
    <div className="bg-bg3 border border-border p-6" style={{ borderRadius: 2 }}>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid stroke="#1e1e1e" />
          <XAxis type="number" dataKey="x" name="Confidence" domain={[0, 10]} label={{ value: 'Confidence →', fill: '#5a5650', fontSize: 10, fontFamily: 'DM Mono', position: 'insideBottom', offset: -5 }} tick={{ fill: '#5a5650', fontSize: 11, fontFamily: 'DM Mono' }} />
          <YAxis type="number" dataKey="y" name="Accuracy" domain={[0, 10]} label={{ value: 'Accuracy →', fill: '#5a5650', fontSize: 10, fontFamily: 'DM Mono', angle: -90, position: 'insideLeft' }} tick={{ fill: '#5a5650', fontSize: 11, fontFamily: 'DM Mono' }} />
          <RechartTooltip content={<CustomTooltip />} />
          <ReferenceLine x={5} stroke="#2a2a2a" strokeDasharray="3 3" />
          <ReferenceLine y={5} stroke="#2a2a2a" strokeDasharray="3 3" />
          <Scatter
            data={data}
            fill="#5c4fff"
            shape={(props: any) => {
              const { cx, cy, payload } = props
              const isDanger = payload.x > 5 && payload.y < 5
              return (
                <g>
                  <circle cx={cx} cy={cy} r={6} fill={isDanger ? '#EF4444' : payload.x > 5 && payload.y > 5 ? '#22C55E' : '#5c4fff'} />
                  <text x={cx} y={cy - 10} textAnchor="middle" fill="#5a5650" fontSize={10} fontFamily="DM Mono">{payload.name}</text>
                </g>
              )
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Question card ──────────────────────────────────────────────────────────────

function QuestionCard({ q, index }: { q: QuestionResult; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const scoreColor = (v: number) => v > 7 ? 'text-success' : v > 5 ? 'text-warning' : 'text-danger'

  return (
    <motion.div
      variants={revealVariants}
      className="bg-bg2 border border-border p-6 hover:border-border/80 transition-colors"
      style={{ borderRadius: 2 }}
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-mono-sm bg-bg3 border border-border px-3 py-1 text-t2" style={{ borderRadius: 2 }}>Q{index + 1}</span>
          <SectionBadge variant="time" label={q.type} />
        </div>
        <div className="flex items-center gap-3">
          <EmotionOrb emotion={(q.emotion as any) || 'neutral'} size="sm" />
          <span className={`font-mono text-h2 ${scoreColor(q.score)}`}>{q.score.toFixed(1)}/10</span>
        </div>
      </div>
      <p className="text-h2 text-t1 mb-5">{q.question}</p>
      <div className="border-t border-border-sub my-5" />
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-label font-mono text-t3 mb-2">WHAT YOU SAID</p>
          <p className={`text-body text-t2 ${!expanded ? 'line-clamp-4' : ''}`}>{q.answer || 'No answer recorded.'}</p>
          {q.answer && q.answer.length > 200 && (
            <button onClick={() => setExpanded(!expanded)} className="text-body-sm text-accent-light hover:text-accent mt-2 transition-colors">
              {expanded ? 'Show less ↑' : 'Show more →'}
            </button>
          )}
        </div>
        <div>
          <p className="text-label font-mono text-t3 mb-2">WHAT THEY WANTED</p>
          <p className="text-body text-t2">{q.idealAnswer || 'A concise, structured answer demonstrating depth and practical experience.'}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-border-sub">
        {[{ label: 'Accuracy', val: q.accuracy }, { label: 'Clarity', val: q.clarity }, { label: 'Confidence', val: q.confidence }, { label: 'Depth', val: q.depth }].map(d => (
          <div key={d.label} className="text-center">
            <p className="text-label font-mono text-t4">{d.label}</p>
            <p className={`font-mono text-mono-lg mt-1 ${scoreColor(d.val || 0)}`}>
              <AnimatedNumber value={d.val || 0} decimals={1} />
            </p>
            <div className="h-1 mt-1.5 bg-border overflow-hidden" style={{ borderRadius: 0 }}>
              <motion.div
                className={`h-full ${(d.val || 0) > 7 ? 'bg-success' : (d.val || 0) > 5 ? 'bg-warning' : 'bg-danger'}`}
                initial={{ width: '0%' }}
                animate={{ width: `${(d.val || 0) * 10}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
      {q.note && (
        <div className="mt-5 p-4 border-l-2" style={{ backgroundColor: 'rgba(92,79,255,0.05)', borderLeftColor: '#5c4fff' }}>
          <p className="text-label font-mono mb-2" style={{ color: 'rgba(92,79,255,0.70)' }}>INTERVIEWER NOTED</p>
          <p className="text-body text-t2 italic">{q.note}</p>
        </div>
      )}
    </motion.div>
  )
}

// ── Shadow question item (extracted as separate component to fix hook-in-map) ──

function ShadowQuestionItem({ sq, i }: { sq: { question: string; why: string; howToPrepare: string }; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } } }}
      className="border overflow-hidden"
      style={{ borderRadius: 2, backgroundColor: '#0f0a1e', borderColor: 'rgba(139,92,246,0.25)', borderTopWidth: 2, borderTopColor: '#8B5CF6' }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="font-mono text-label text-phase-interview uppercase tracking-wide">SHADOW Q #{i + 1}</span>
          <AlertTriangle size={16} className="text-warning flex-shrink-0" />
        </div>
        <p className="text-h2 text-t1 italic mb-5">{sq.question}</p>
        <div className="border-t border-border-sub" />
        <Collapsible.Root open={open} onOpenChange={setOpen}>
          <Collapsible.Content>
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-label font-mono text-t3 mb-2">WHY IT WAS COMING</p>
                <p className="text-body text-t2">{sq.why}</p>
              </div>
              <div>
                <p className="text-label font-mono text-t3 mb-2">HOW TO PREPARE</p>
                <p className="text-body text-t2">{sq.howToPrepare}</p>
              </div>
            </div>
          </Collapsible.Content>
          <Collapsible.Trigger asChild>
            <button className="flex items-center gap-1 mt-4 text-body-sm text-accent-light hover:text-accent transition-colors cursor-pointer">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {open ? 'Collapse' : 'Why it was coming + how to prepare'}
            </button>
          </Collapsible.Trigger>
        </Collapsible.Root>
      </div>
    </motion.div>
  )
}

function ShadowQuestions({ questions }: { questions: { question: string; why: string; howToPrepare: string }[] }) {
  const shadowQs = questions.length > 0 ? questions : [
    { question: "How would you handle disagreeing with your tech lead's architectural decision?", why: "Your resume shows team work but no mention of conflict resolution or technical disagreements.", howToPrepare: "Prepare a STAR story about technical disagreement. Focus on process, not outcome." },
    { question: "Describe how you've handled a production outage at 3am. What's your runbook?", why: "Your on-call experience is implied but never stated.", howToPrepare: "Build a concrete incident response story: detection → triage → mitigation → postmortem." },
    { question: "Walk me through the largest codebase you've worked in. How did you navigate it?", why: "Scale is entirely absent from your answers.", howToPrepare: "Quantify: lines of code, team size, time to onboard, your navigation strategy." },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="flex flex-col gap-5">
      {shadowQs.map((sq, i) => <ShadowQuestionItem key={i} sq={sq} i={i} />)}
    </motion.div>
  )
}

// ── Improvement plan ──────────────────────────────────────────────────────────

function ImprovementPlan({ items }: { items: { title: string; instructions: string; timeline: string }[] }) {
  const planItems = items.length > 0 ? items : [
    { title: 'Quantify your impact in every answer', instructions: 'For every behavioral question, include a number: time saved, revenue impacted, users affected. Spend 30 mins rewriting your 5 most common answers with metrics.', timeline: '3 days' },
    { title: 'Build one complete system design story', instructions: "Pick one system you've built or studied deeply. Prepare to walk through it at 3 levels: 30 seconds, 5 minutes, 30 minutes. Practice out loud.", timeline: '1 week' },
    { title: 'Eliminate filler words in technical answers', instructions: 'Record yourself answering "How does a hashmap work?" Set a rule: zero "um", "uh", or "basically". Re-record until clean.', timeline: '2 weeks' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {planItems.map((item, i) => (
        <div key={i} className="bg-bg2 border border-border p-6 flex gap-6 items-start" style={{ borderRadius: 2, borderLeft: '3px solid #10B981' }}>
          <span className="font-mono leading-none mt-1 flex-shrink-0" style={{ fontSize: '2rem', color: 'rgba(42,42,42,0.6)' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="flex-1">
            <p className="text-label font-mono text-phase-report mb-1">WHAT</p>
            <p className="text-h3 text-t1 font-semibold mb-3">{item.title}</p>
            <p className="text-label font-mono text-t3 mb-1">HOW</p>
            <p className="text-body text-t2">{item.instructions}</p>
          </div>
          <span className="flex-shrink-0 bg-bg3 border border-border px-3 py-1 font-mono text-mono-sm text-t2 self-start" style={{ borderRadius: 2 }}>
            {item.timeline}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main report page ──────────────────────────────────────────────────────────

export default function Report() {
  const [, setLocation] = useLocation()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  useEffect(() => {
    // First: check if analyze result was stored in sessionStorage (avoids DB race condition)
    const cached = sessionStorage.getItem('reportData')
    if (cached) {
      try {
        const data = JSON.parse(cached)
        setReport(data)
        setLoading(false)
        return
      } catch {}
    }

    const sid = sessionStorage.getItem('sessionId')
    if (!sid) {
      setReport(getMockReport())
      setLoading(false)
      return
    }

    // Poll DB with retries — analyze may still be writing
    let attempts = 0
    const maxAttempts = 15 // 15 * 2s = 30s max

    const poll = async () => {
      attempts++
      try {
        const res = await fetch(`/api/sessions/${sid}`)
        const data = await res.json()
        const s = data.session
        if (!s) {
          if (attempts < maxAttempts) { setTimeout(poll, 2000); return }
          setReport(getMockReport()); setLoading(false); return
        }

        const metrics = typeof s.metrics === 'string' ? JSON.parse(s.metrics) : (s.metrics || {})
        const questions = typeof s.questions === 'string' ? JSON.parse(s.questions) : (s.questions || [])
        const ra = typeof s.resumeAnalysis === 'string' ? JSON.parse(s.resumeAnalysis) : (s.resumeAnalysis || {})

        // If analyze hasn't written verdict yet, keep polling
        if (!s.verdict && attempts < maxAttempts) { setTimeout(poll, 2000); return }

        setReport({
          verdict: s.verdict || 'BORDERLINE',
          score: metrics.overall || 7.2,
          debrief: s.debrief || 'You demonstrated solid technical knowledge but struggled to quantify your impact.',
          metrics: { totalQuestions: questions.length || 8, avgConfidence: metrics.confidence || 6.8, peakStress: metrics.stress || 0.71, bestMoment: metrics.bestMoment || 'Q4' },
          questions: ra.questions || [],
          shadowQuestions: ra.shadowQuestions || [],
          improvementPlan: ra.improvementPlan || [],
          heatmapData: ra.heatmapData || [],
          voiceData: ra.voiceData || [],
          verdictQuote: ra.verdictQuote || 'You sounded most confident on the question you answered least accurately.',
        })
        setLoading(false)
      } catch {
        if (attempts < maxAttempts) { setTimeout(poll, 2000) }
        else { setReport(getMockReport()); setLoading(false) }
      }
    }
    poll()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-bg0 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-full max-w-sm">
          <AILoadingCard customMessages={['Analyzing your session...', 'Scoring each question...', 'Building your verdict...', 'Generating improvement plan...']} />
        </div>
        <p className="font-mono text-mono-sm text-t4 text-center">This takes 15–30 seconds. Don't close the tab.</p>
      </div>
    )
  }

  if (!report) return null

  const vs = VERDICT_STYLES[report.verdict] || VERDICT_STYLES['BORDERLINE']

  return (
    <div className="min-h-screen bg-bg0">

      {/* ── HERO ── */}
      <div className="relative py-24 text-center border-b" style={{ background: '#0a0a0a', borderColor: '#1e1e1e' }}>
        <div className="max-w-4xl mx-auto px-8 relative">
          <PhaseLabel phase="report" text="PHASE 3 — THE REPORT" />

          <div className="flex justify-center mt-8">
            <motion.div
              variants={verdictBadge} initial="hidden" animate="visible"
              className="inline-flex items-center border-2 px-10 py-5"
              style={{ borderRadius: 2, borderColor: vs.border, backgroundColor: vs.bg, boxShadow: vs.shadow }}
            >
              <span className="font-serif font-bold" style={{ fontSize: '3rem', color: vs.text, letterSpacing: '-0.02em' }}>
                {report.verdict}
              </span>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="font-mono text-display-md text-t1 mt-6"
          >
            <AnimatedNumber value={report.score} decimals={1} suffix=" / 10" />
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="font-serif italic text-t2 max-w-2xl mx-auto mt-8"
            style={{ fontSize: '1.2rem', lineHeight: 1.7 }}
          >
            {report.debrief}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="grid grid-cols-4 gap-4 mt-12"
          >
            {[
              { label: 'Total Questions', value: report.metrics.totalQuestions, decimals: 0 },
              { label: 'Avg Confidence', value: report.metrics.avgConfidence, decimals: 1 },
              { label: 'Peak Stress', value: report.metrics.peakStress, decimals: 2 },
              { label: 'Best Moment', value: null, text: report.metrics.bestMoment },
            ].map(m => (
              <div key={m.label} className="bg-bg2 border border-border p-4 text-center" style={{ borderRadius: 2 }}>
                <p className="font-mono text-h1 text-accent">
                  {m.text ? m.text : <AnimatedNumber value={m.value!} decimals={m.decimals} />}
                </p>
                <p className="text-label font-mono text-t3 mt-1">{m.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── HEATMAP ── */}
      <div className="py-24 border-b" style={{ backgroundColor: '#0d0d0d', borderColor: '#1e1e1e' }}>
        <div className="max-w-5xl mx-auto px-8">
          <Section>
            <PhaseLabel text="01  NERVOUSNESS HEATMAP" />
            <h2 className="font-serif text-t1 mt-2" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>When You Were Most Exposed</h2>
            <p className="text-body-lg text-t2 mt-3 mb-10">Every second of the session. Stress mapped against your baseline.</p>
          </Section>
          <NervousnessHeatmap data={report.heatmapData} />
          <div className="mt-10">
            <DifferentiatorBox
              label="THE 2-SECOND GAP"
              text="Before you answered Question 3, you hesitated 2.4 seconds. Your face changed before your voice did. That window is marked above."
            />
          </div>
        </div>
      </div>

      {/* ── VOICE ── */}
      <div className="py-24 max-w-5xl mx-auto px-8 border-b" style={{ borderColor: '#1e1e1e' }}>
        <Section>
          <PhaseLabel text="02  VOICE ANALYSIS" />
          <h2 className="font-serif text-t1 mt-2" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Your Voice on the Record</h2>
          <p className="text-body-lg text-t2 mt-3 mb-10">Pitch vs calibration baseline. Divergence = stress.</p>
        </Section>
        <VoiceChart data={report.voiceData} />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-bg2 border border-border p-4 text-center" style={{ borderRadius: 2 }}>
            <p className="font-mono text-h1 text-warning">+12 WPM</p>
            <p className="text-label font-mono text-t3 mt-1">Speech Rate vs Baseline</p>
          </div>
          <div className="bg-bg2 border border-border p-4 text-center" style={{ borderRadius: 2 }}>
            <p className="font-mono text-h1 text-danger">±31Hz</p>
            <p className="text-label font-mono text-t3 mt-1">Pitch Variance</p>
          </div>
        </div>
      </div>

      {/* ── CONFIDENCE vs ACCURACY ── */}
      <div className="py-24 border-b" style={{ backgroundColor: '#0d0d0d', borderColor: '#1e1e1e' }}>
        <div className="max-w-5xl mx-auto px-8">
          <Section>
            <PhaseLabel text="03  CONFIDENCE vs ACCURACY" />
            <h2 className="font-serif text-t1 mt-2" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>When You Were Wrong and Sure</h2>
            <p className="text-body-lg text-t2 mt-3">Confident wrongness signals poor self-awareness. The most expensive mistake in an interview.</p>
          </Section>
          <div className="mt-10"><ConfidenceAccuracyChart questions={report.questions} /></div>
          <p className="text-body-lg text-danger italic mt-6">You scored in the danger zone on Q2 and Q5.</p>
        </div>
      </div>

      {/* ── QUESTION BREAKDOWN ── */}
      <div className="py-24 max-w-5xl mx-auto px-8 border-b" style={{ borderColor: '#1e1e1e' }}>
        <Section>
          <PhaseLabel text="04  QUESTION BY QUESTION" />
          <h2 className="font-serif text-t1 mt-2" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>The Full Breakdown</h2>
          <p className="text-body-lg text-t2 mt-3 mb-10">Every question. Scored across 4 dimensions. Every answer with what was expected.</p>
        </Section>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} className="flex flex-col gap-4">
          {(report.questions.length > 0 ? report.questions : getMockQuestions()).map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i} />
          ))}
        </motion.div>
      </div>

      {/* ── SHADOW QUESTIONS ── */}
      <div className="py-24 border-b" style={{ backgroundColor: '#0d0d0d', borderColor: '#1e1e1e' }}>
        <div className="max-w-5xl mx-auto px-8">
          <Section>
            <PhaseLabel text="05  SHADOW QUESTIONS" />
            <h2 className="font-serif text-t1 mt-2" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Questions the AI Wanted to Ask</h2>
            <p className="text-body-lg text-t2 mt-3 mb-10">Three questions that never made it in. Study these before your real interview.</p>
          </Section>
          <ShadowQuestions questions={report.shadowQuestions} />
        </div>
      </div>

      {/* ── IMPROVEMENT PLAN ── */}
      <div className="py-24 max-w-5xl mx-auto px-8 border-b" style={{ borderColor: '#1e1e1e' }}>
        <Section>
          <PhaseLabel text="06  IMPROVEMENT PLAN" />
          <h2 className="font-serif text-t1 mt-2" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Fix These Before Your Real Interview</h2>
          <p className="text-body-lg text-t2 mt-3 mb-10">Three specific things. With timelines.</p>
        </Section>
        <ImprovementPlan items={report.improvementPlan} />
      </div>

      {/* ── VERDICT QUOTE ── */}
      <div className="py-24 border-b" style={{ backgroundColor: '#0d0d0d', borderColor: '#1e1e1e' }}>
        <div className="max-w-3xl mx-auto px-8 text-center">
          <p className="text-label font-mono text-t3 mb-10 uppercase tracking-widest">The Line</p>
          <Section>
            <blockquote className="font-serif italic text-t1" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', lineHeight: 1.4, fontWeight: 700 }}>
              "{report.verdictQuote}"
            </blockquote>
            <p className="text-label font-mono text-t3 mt-6">— AI Interviewer · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </Section>
        </div>
      </div>

      {/* ── DELIVERABLES ── */}
      <div className="py-24 border-b" style={{ borderColor: '#1e1e1e' }}>
        <div className="max-w-5xl mx-auto px-8">
          <Section>
            <PhaseLabel text="07  DELIVERABLES" />
            <h2 className="font-serif text-t1 mt-2" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Take It With You</h2>
            <p className="text-body-lg text-t2 mt-3 mb-10">Download your full report and session recording.</p>
          </Section>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg2 border border-border p-6" style={{ borderRadius: 2, borderTop: '2px solid #10B981' }}>
              <FileText size={40} className="text-phase-report mb-4" />
              <p className="text-h3 text-t1 font-semibold mb-1">Full Report PDF</p>
              <p className="text-body-sm text-t3 mb-4">All scores, charts, shadow questions, plan</p>
              <GlowButton size="md" fullWidth loading={downloadingPDF}
                onClick={() => { setDownloadingPDF(true); setTimeout(() => setDownloadingPDF(false), 1500) }}>
                <Download size={16} /> Download PDF
              </GlowButton>
            </div>
            <div className="bg-bg3 border border-border p-6" style={{ borderRadius: 2, borderTop: '2px solid #8B5CF6' }}>
              <Video size={40} className="text-phase-interview mb-4" />
              <p className="text-h3 text-t1 font-semibold mb-1">Session Recording</p>
              <p className="text-body-sm text-t3 mb-4">Full video · Timestamped questions</p>
              <GlowButton size="md" fullWidth variant="secondary"><Download size={16} /> Download WebM</GlowButton>
            </div>
          </div>
          <div className="mt-16 flex flex-col items-center gap-4">
            <GlowButton size="lg" onClick={() => setLocation('/setup')}>Start Another Interview →</GlowButton>
            <button onClick={() => setLocation('/')} className="text-body text-t2 hover:text-t1 transition-colors">← Back to Dashboard</button>
          </div>
        </div>
      </div>

      <div className="pb-24" />
    </div>
  )
}

// ── Mock data ──────────────────────────────────────────────────────────────────

function getMockReport(): ReportData {
  return {
    verdict: 'BORDERLINE', score: 7.2,
    debrief: 'You demonstrated solid technical knowledge but struggled to quantify your impact. The hesitation before technical questions was notable — your face changed before you spoke. Strongest moment: Q4 system design. Weakest: anything requiring a concrete metric.',
    metrics: { totalQuestions: 8, avgConfidence: 6.8, peakStress: 0.71, bestMoment: 'Q4' },
    questions: getMockQuestions(), shadowQuestions: [], improvementPlan: [],
    heatmapData: [], voiceData: [],
    verdictQuote: 'You sounded most confident on the question you answered least accurately.',
  }
}

function getMockQuestions(): QuestionResult[] {
  return [
    { id: 'q1', question: 'Tell me about a time you had to debug a complex production issue under pressure.', type: 'Behavioral', answer: 'We had a memory leak in production causing OOMs every 6 hours. I set up heap profiling and traced it to a closure holding references...', idealAnswer: 'A clear STAR format with specific metrics: time to detect, resolve, user impact, and prevention changes.', accuracy: 7.5, clarity: 8.0, confidence: 7.2, depth: 6.8, score: 7.4, note: 'Good structure but you never quantified the impact. How many users affected?', emotion: 'engaged' },
    { id: 'q2', question: 'How would you design a URL shortener that handles 100M requests per day?', type: 'System Design', answer: 'I would use a distributed key-value store like Redis for caching...', idealAnswer: 'Cover: API gateway, hash generation (base62), database choice with sharding, CDN, analytics, rate limiting.', accuracy: 5.8, clarity: 7.0, confidence: 8.5, depth: 5.2, score: 6.6, note: 'Confident but shallow. Skipped hash collision, DB write bottleneck, geographic distribution.', emotion: 'confident' },
    { id: 'q3', question: 'Walk me through how you would optimize a slow database query causing timeouts.', type: 'Technical', answer: 'First I would EXPLAIN ANALYZE the query to see the execution plan, then look for missing indexes...', idealAnswer: 'EXPLAIN ANALYZE → identify table scans → add indexes → query rewrite → connection pooling → read replicas.', accuracy: 8.2, clarity: 8.5, confidence: 7.8, depth: 8.0, score: 8.1, note: "Strong answer. Only gap: didn't mention connection pool exhaustion as a common timeout cause.", emotion: 'confident' },
    { id: 'q4', question: 'Describe your experience with distributed systems and consistency models.', type: 'Technical', answer: "I've worked with eventual consistency in a microservices setup...", idealAnswer: 'Demonstrate CAP theorem knowledge, explain strong/eventual consistency tradeoffs, give concrete examples.', accuracy: 6.5, clarity: 6.8, confidence: 5.5, depth: 6.0, score: 6.2, note: "You know the terms but couldn't connect them to real decisions. Theory without application.", emotion: 'nervous' },
  ]
}
