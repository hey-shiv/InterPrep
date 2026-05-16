import { motion } from 'framer-motion'
import { useLocation } from 'wouter'
import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Camera,
  CheckCircle2,
  FileText,
  Gauge,
  History,
  Layers3,
  Mic,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { GlowButton } from '../components/ui/GlowButton'
import { PhaseLabel } from '../components/ui/PhaseLabel'
import { SectionBadge } from '../components/ui/SectionBadge'
import { DifferentiatorBox } from '../components/ui/DifferentiatorBox'
import { WaveformVisualizer } from '../components/ui/WaveformVisualizer'
import { revealVariants, staggerContainer } from '../../lib/motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'

type IconType = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

function FadeUp({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

function RevealSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { ref, controls } = useScrollReveal()
  return (
    <motion.div ref={ref} animate={controls} initial="hidden" variants={revealVariants} className={className}>
      {children}
    </motion.div>
  )
}

function Navbar({ onStartClick }: { onStartClick: () => void }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border-sub bg-bg0/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#" className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-[8px] border border-accent/50 bg-accent text-bg0 shadow-glow-sm">
            <Sparkles size={16} strokeWidth={2.6} />
          </span>
          <span className="text-h3 font-bold text-t1">InterPrep</span>
        </a>

        <div className="hidden items-center gap-1 rounded-full border border-border-sub bg-bg2/70 p-1 md:flex">
          {[
            ['The Flow', '#how-it-works'],
            ['Signals', '#signals'],
            ['Reports', '#reports'],
            ['Archive', '#past-sessions'],
          ].map(([label, href]) => (
            <a key={label} href={href} className="rounded-full px-4 py-2 text-body-sm text-t2 transition-colors hover:bg-bg3 hover:text-t1">
              {label}
            </a>
          ))}
        </div>

        <GlowButton size="sm" onClick={onStartClick}>
          Start <ArrowRight size={15} />
        </GlowButton>
      </div>
    </nav>
  )
}

function SignalTile({ label, value, tone = 'text-t1' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="edition-panel-quiet p-4">
      <p className={`font-mono text-h2 ${tone}`}>{value}</p>
      <p className="mt-1 text-label font-mono uppercase text-t3">{label}</p>
    </div>
  )
}

function ControlRoomPreview() {
  const heatmap = [22, 34, 28, 46, 72, 56, 31, 42, 78, 64, 38, 24, 44, 58, 35, 29, 69, 82, 48, 32]

  return (
    <div className="edition-panel relative mx-auto mt-10 w-full overflow-hidden p-4" style={{ maxWidth: 1120 }}>
      <div className="scanline pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
            </span>
            <span className="font-mono text-label uppercase text-danger">Live simulation</span>
          </div>
          <SectionBadge variant="time" label="Q3 - System Design" />
        </div>

        <div className="relative aspect-[16/7] min-h-[360px] overflow-hidden rounded-[8px] border border-border-sub bg-bg3">
          <div className="edition-grid absolute inset-0 opacity-45" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border-sub bg-bg0/70 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-accent" />
              <span className="font-mono text-mono-sm text-t2">camera baseline locked</span>
            </div>
            <span className="font-mono text-mono-sm text-warning">07:34</span>
          </div>

          <div className="absolute left-6 top-20 max-w-2xl text-left">
            <p className="font-serif text-[2rem] font-bold leading-tight text-t1 md:text-[3.2rem]">
              Design a rate limiter for a distributed API handling 100M requests a day.
            </p>
            <p className="mt-4 max-w-lg text-body text-t2">
              The answer is scored against structure, tradeoffs, and whether confidence matches accuracy.
            </p>
          </div>

          <div className="absolute right-5 top-20 grid w-64 grid-cols-2 gap-3">
            <SignalTile label="Gap" value="2.4s" tone="text-danger" />
            <SignalTile label="Voice" value="+18Hz" tone="text-warning" />
            <SignalTile label="Fillers" value="03" tone="text-accent" />
            <SignalTile label="Depth" value="8.1" tone="text-success" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 grid gap-0 border-t border-border-sub bg-bg0/88 backdrop-blur lg:grid-cols-[0.62fr_0.38fr]">
            <div className="flex min-w-0 items-center gap-3 px-4 py-3">
              <WaveformVisualizer active />
              <span className="truncate font-mono text-mono-sm text-t2">Listening for structure, tradeoffs, and confidence drift...</span>
            </div>
            <div className="border-t border-border-sub px-4 py-3 lg:border-l lg:border-t-0">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-label font-mono uppercase text-t3">Stress trace</p>
                <Activity size={15} className="text-accent" />
              </div>
              <div className="flex h-12 items-end gap-1">
                {heatmap.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[2px]"
                    style={{
                      height: `${h}%`,
                      backgroundColor: h > 68 ? '#EF4444' : h > 45 ? '#F59E0B' : '#c6f432',
                      opacity: h > 68 ? 0.82 : 0.58,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-[8px] border border-border-sub bg-bg0/70 p-4 text-left">
          <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-success" />
          <div>
            <p className="text-h3 font-semibold text-t1">Verdict-ready analysis</p>
            <p className="mt-1 text-body-sm text-t3">Question scores, shadow questions, and improvement plan are assembled while the session closes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero({ onStartClick, onViewSessions }: { onStartClick: () => void; onViewSessions: () => void }) {
  return (
    <section className="relative overflow-hidden border-b border-border-sub app-shell-bg">
      <div className="edition-grid absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col px-5 pb-16 pt-20 text-left md:px-8" style={{ paddingLeft: 72, paddingRight: 32 }}>
        <FadeUp>
          <span className="edition-pill inline-flex items-center gap-2 px-4 py-2 font-mono text-label uppercase text-accent">
            <Sparkles size={13} />
            Renaissance mode for interview prep
          </span>
        </FadeUp>

        <FadeUp delay={0.08} className="mt-7 max-w-5xl">
          <h1 className="font-serif text-[5.25rem] font-black leading-[0.86] text-t1 md:text-[8.5rem] xl:text-[10rem]">
            InterPrep
          </h1>
          <p className="mt-6 text-[1.6rem] font-semibold leading-tight text-t1 md:text-[2.4rem]">
            A live AI interview room that reads the resume, watches the pause, and gives the verdict.
          </p>
        </FadeUp>

        <FadeUp delay={0.18} className="mt-6 max-w-2xl">
          <p className="text-body-lg text-t2">
            Desktop-only interview practice with camera calibration, adaptive questions, voice signals, and a recruiter-style report you can actually use before the real round.
          </p>
        </FadeUp>

        <FadeUp delay={0.28} className="mt-9 flex flex-wrap justify-start gap-3">
          <GlowButton size="lg" onClick={onStartClick}>
            Begin interview <ArrowRight size={18} />
          </GlowButton>
          <GlowButton size="lg" variant="secondary" onClick={onViewSessions}>
            <History size={18} /> View archive
          </GlowButton>
        </FadeUp>

        <FadeUp delay={0.36} className="mt-7 flex flex-wrap justify-start gap-2">
          {['10 minute session', 'Resume-aware questions', 'Camera + mic baseline', 'Full verdict report'].map(chip => (
            <span key={chip} className="edition-pill px-4 py-2 text-body-sm text-t2">{chip}</span>
          ))}
        </FadeUp>

        <FadeUp delay={0.44}>
          <ControlRoomPreview />
        </FadeUp>
      </div>
    </section>
  )
}

function Ticker({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-border-sub bg-bg1 py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="mx-6 inline-flex flex-shrink-0 items-center gap-4 font-mono text-mono-sm text-t3">
            <span className="h-1 w-1 flex-shrink-0 bg-accent" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function EditionIndex({ onStart }: { onStart: () => void }) {
  const updates = [
    { Icon: Brain, label: 'Resume intelligence', text: 'Turns claims, gaps, and project signals into the interviewer brief.' },
    { Icon: Camera, label: 'Composure tracking', text: 'Captures the silent pre-answer window before the polished answer begins.' },
    { Icon: Gauge, label: 'Live delivery metrics', text: 'Voice delta, pace, fillers, and confidence drift in one readable layer.' },
    { Icon: Layers3, label: 'Verdict report', text: 'Scores, shadow questions, and a focused improvement plan after the session.' },
  ]

  return (
    <section id="signals" className="border-b border-border-sub bg-bg0 py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <RevealSection className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <PhaseLabel text="Edition notes" />
            <h2 className="mt-4 font-serif text-[3rem] font-black leading-none text-t1 md:text-[4.75rem]">
              Everything that matters, visible at once.
            </h2>
          </div>
          <div className="edition-panel p-5 md:p-6">
            <p className="text-body-lg text-t2">
              Inspired by Shopify Editions' product-update storytelling, InterPrep now frames each capability as a visible system: what is being watched, why it matters, and what happens next.
            </p>
            <div className="mt-5">
              <GlowButton onClick={onStart}>
                Run the flow <ArrowRight size={16} />
              </GlowButton>
            </div>
          </div>
        </RevealSection>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {updates.map(({ Icon, label, text }) => (
            <motion.div key={label} variants={revealVariants} className="edition-panel p-5 transition-colors hover:border-accent/60">
              <Icon size={24} className="text-accent" />
              <p className="mt-5 text-h3 font-semibold text-t1">{label}</p>
              <p className="mt-2 text-body-sm text-t3">{text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function PhaseChapter({
  num,
  phaseLabel,
  title,
  body,
  features,
  accentColor,
  icon: Icon,
  visual,
  reverse = false,
}: {
  num: string
  phaseLabel: string
  title: string
  body: string
  features: string[]
  accentColor: string
  icon: IconType
  visual: ReactNode
  reverse?: boolean
}) {
  const { ref, controls } = useScrollReveal()
  return (
    <section id={`phase-${num}`} className="border-b border-border-sub bg-bg0 py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.div
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={staggerContainer}
          className={`grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 ${reverse ? 'lg:[direction:rtl]' : ''}`}
        >
          <motion.div variants={revealVariants} style={{ direction: 'ltr' }} className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[8px] border" style={{ borderColor: accentColor, color: accentColor, backgroundColor: `${accentColor}14` }}>
                <Icon size={20} />
              </span>
              <div>
                <p className="font-mono text-label uppercase text-t3">Update {num}</p>
                <p className="font-mono text-label uppercase" style={{ color: accentColor }}>{phaseLabel}</p>
              </div>
            </div>
            <h2 className="mt-6 font-serif text-[2.5rem] font-black leading-[0.95] text-t1 md:text-[4rem]">
              {title}
            </h2>
            <p className="mt-5 max-w-xl text-body-lg text-t2">{body}</p>
            <div className="mt-8 grid gap-3">
              {features.map(f => (
                <div key={f} className="flex items-start gap-3 text-body text-t2">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={revealVariants} style={{ direction: 'ltr' }} className="w-full">
            {visual}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function BriefingPreview() {
  return (
    <div className="edition-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-sub p-5">
        <p className="font-mono text-label uppercase text-phase-entry">Interviewer brief</p>
        <ShieldCheck size={17} className="text-phase-entry" />
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div>
          <p className="mb-3 text-label font-mono uppercase text-success">Validated strengths</p>
          {['React and TypeScript depth', 'Systems design exposure', 'Measurable product impact'].map(s => (
            <p key={s} className="mb-2 flex items-start gap-2 text-body-sm text-t2">
              <span className="mt-2 h-1 w-1 bg-success" />
              {s}
            </p>
          ))}
        </div>
        <div>
          <p className="mb-3 text-label font-mono uppercase text-warning">Will probe</p>
          {['Scale claims without numbers', 'Database optimization examples', 'Ownership under pressure'].map(s => (
            <p key={s} className="mb-2 flex items-start gap-2 text-body-sm text-t2">
              <span className="mt-2 h-1 w-1 bg-warning" />
              {s}
            </p>
          ))}
        </div>
      </div>
      <div className="border-t border-border-sub p-5">
        <DifferentiatorBox
          label="Hidden from candidate"
          text="The app prepares the interviewer brief before the session begins, so the questions feel specific instead of generic."
        />
      </div>
    </div>
  )
}

function InterviewPreview() {
  return (
    <div className="edition-panel relative aspect-[4/3] overflow-hidden">
      <div className="edition-grid absolute inset-0 opacity-45" />
      <div className="absolute left-5 top-5 right-5 flex items-center justify-between">
        <SectionBadge variant="time" label="Technical" />
        <span className="font-mono text-h2 text-warning">04</span>
      </div>
      <div className="absolute inset-x-6 top-24">
        <p className="font-serif text-[1.5rem] font-bold leading-tight text-t1 md:text-[2.25rem]">
          You get four seconds of silence before the microphone opens.
        </p>
        <p className="mt-4 text-body text-t2">That gap becomes part of the report, not a forgotten awkward pause.</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 border-t border-border-sub bg-bg0/88 p-5 backdrop-blur">
        <div className="grid grid-cols-3 gap-3">
          <SignalTile label="WPM" value="142" tone="text-accent" />
          <SignalTile label="Pitch" value="+18" tone="text-warning" />
          <SignalTile label="Fillers" value="03" tone="text-success" />
        </div>
      </div>
    </div>
  )
}

function ReportPreview() {
  const points = [
    { x: 20, y: 70, tone: '#22C55E', label: 'Q1' },
    { x: 54, y: 44, tone: '#F59E0B', label: 'Q2' },
    { x: 72, y: 62, tone: '#22C55E', label: 'Q3' },
    { x: 80, y: 31, tone: '#EF4444', label: 'Q4' },
  ]

  return (
    <div className="edition-panel p-5">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-label uppercase text-phase-report">Verdict model</p>
        <span className="rounded-[8px] border border-success/50 bg-success/10 px-4 py-2 font-mono text-h3 text-success">HIRE</span>
      </div>
      <div className="relative h-72 rounded-[8px] border border-border-sub bg-bg3">
        <div className="absolute left-8 right-5 top-5 bottom-8 border-l border-b border-border" />
        <div className="absolute left-9 right-6 top-6 bottom-9">
          {points.map(p => (
            <div key={p.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${100 - p.y}%` }}>
              <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: p.tone, boxShadow: `0 0 18px ${p.tone}88` }} />
              <span className="mt-1 block font-mono text-[10px] text-t3">{p.label}</span>
            </div>
          ))}
        </div>
        <p className="absolute bottom-2 left-10 font-mono text-[10px] uppercase text-t4">Confidence</p>
        <p className="absolute left-2 top-8 origin-left -rotate-90 font-mono text-[10px] uppercase text-t4">Accuracy</p>
      </div>
      <p className="mt-4 text-body-sm text-t3">The report makes overconfidence visible, then gives the next three practice moves.</p>
    </div>
  )
}

function PullQuote() {
  return (
    <section id="reports" className="border-b border-border-sub bg-bg1 py-24">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <RevealSection>
          <p className="mb-6 font-mono text-label uppercase text-accent">The product idea</p>
          <blockquote className="font-serif text-[2.2rem] font-black italic leading-tight text-t1 md:text-[4rem]">
            "The pause before the answer is part of the answer."
          </blockquote>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-t2">
            InterPrep turns that signal into a practical report: what you knew, what you projected, and what you should rehearse next.
          </p>
        </RevealSection>
      </div>
    </section>
  )
}

function PastSessionsSection({ onStart }: { onStart: () => void }) {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [, setLocation] = useLocation()

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(d => { setSessions(d.sessions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const verdictColors = {
    HIRE: { border: '#22C55E', bg: 'rgba(34,197,94,0.08)', text: '#22C55E' },
    BORDERLINE: { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)', text: '#F59E0B' },
    'NO HIRE': { border: '#EF4444', bg: 'rgba(239,68,68,0.08)', text: '#EF4444' },
  }

  return (
    <section id="past-sessions" className="border-b border-border-sub bg-bg0 py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <RevealSection className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <PhaseLabel text="Archive" showLine={false} />
            <h2 className="mt-3 font-serif text-[2.5rem] font-black leading-none text-t1 md:text-[3.75rem]">Your past sessions.</h2>
          </div>
          <GlowButton variant="secondary" onClick={onStart}>
            New interview <ArrowRight size={16} />
          </GlowButton>
        </RevealSection>

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map(i => (
                <div key={i} className="edition-panel h-32 animate-pulse p-5">
                  <div className="h-4 w-24 rounded bg-bg3" />
                  <div className="mt-6 h-5 w-1/2 rounded bg-bg3" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-bg3" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="edition-panel flex flex-col items-center justify-center px-5 py-18 text-center">
              <Target size={46} className="mb-5 text-t4" />
              <h3 className="text-h2 font-semibold text-t1">No sessions yet.</h3>
              <p className="mt-2 max-w-sm text-body text-t3">Run your first mock interview and the archive becomes your progress timeline.</p>
              <div className="mt-7">
                <GlowButton size="md" onClick={onStart}>
                  Start first interview <ArrowRight size={16} />
                </GlowButton>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.slice(0, 6).map((s: any) => {
                const verdict = s.verdict || 'BORDERLINE'
                const vc = verdictColors[verdict as keyof typeof verdictColors] || verdictColors.BORDERLINE
                const metrics = typeof s.metrics === 'string' ? JSON.parse(s.metrics) : (s.metrics || {})
                return (
                  <motion.div
                    key={s.id}
                    className="edition-panel grid gap-5 p-5 transition-colors hover:border-accent/60 md:grid-cols-[auto_1fr_auto] md:items-center"
                    whileHover={{ y: -2 }}
                  >
                    <span
                      className="inline-flex w-fit px-4 py-2 text-label font-mono font-bold uppercase"
                      style={{ borderRadius: 8, border: `1px solid ${vc.border}`, backgroundColor: vc.bg, color: vc.text }}
                    >
                      {verdict}
                    </span>
                    <div>
                      <p className="text-h3 font-semibold text-t1">{s.jobRole || s.roleTitle || 'Interview session'}</p>
                      <p className="mt-1 font-mono text-mono-sm text-t3">
                        {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {metrics.overall ? ` - ${metrics.overall}/10` : ''}
                      </p>
                    </div>
                    <GlowButton size="sm" variant="secondary" onClick={() => setLocation(`/report?id=${s.id}`)}>
                      View report <ArrowRight size={14} />
                    </GlowButton>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-bg0 px-5 py-12 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-border-sub pt-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-accent text-bg0">
            <Sparkles size={16} />
          </span>
          <span className="text-h3 font-bold text-t1">InterPrep</span>
        </div>
        <p className="font-mono text-mono-sm text-t4">Desktop interview lab - React, Groq, camera and voice signals</p>
      </div>
    </footer>
  )
}

export default function Landing() {
  const [, setLocation] = useLocation()

  const handleStart = () => setLocation('/setup')
  const handleViewSessions = () => {
    document.getElementById('past-sessions')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-bg0">
      <Navbar onStartClick={handleStart} />
      <Hero onStartClick={handleStart} onViewSessions={handleViewSessions} />
      <Ticker items={['Resume intelligence', 'Composure window', 'Adaptive questions', 'Voice delta', 'Confidence vs accuracy', 'Shadow questions', 'Improvement plan']} />
      <EditionIndex onStart={handleStart} />

      <div id="how-it-works">
        <PhaseChapter
          num="01"
          phaseLabel="Entry - Resume intelligence"
          accentColor="#0EA5E9"
          title="The interviewer reads before you speak."
          body="Upload a resume, choose a role, and InterPrep builds a private brief from the claims, gaps, and projects most likely to show up in a real interview."
          features={['Extracts verifiable strengths and risky claims', 'Turns vague bullets into targeted probes', 'Keeps the interviewer brief out of the candidate view']}
          icon={FileText}
          visual={<BriefingPreview />}
        />

        <PhaseChapter
          num="02"
          phaseLabel="Interview - live session"
          accentColor="#8B5CF6"
          title="The room watches the pause."
          body="Questions reveal one by one. A four-second composure window opens before you answer, then voice and delivery signals are tracked while you speak."
          features={['Adaptive question flow by role and resume', 'Browser-native camera and microphone checks', 'Live WPM, pitch shift, fillers, and response timing']}
          icon={Mic}
          visual={<InterviewPreview />}
          reverse
        />

        <PhaseChapter
          num="03"
          phaseLabel="Report - verdict and plan"
          accentColor="#10B981"
          title="The report shows what to fix next."
          body="A clear verdict, question-by-question scoring, shadow questions, and a concrete improvement plan turn a stressful mock round into a practice system."
          features={['Confidence vs accuracy chart', 'Nervousness heatmap and voice baseline', 'Three practical follow-up drills with timelines']}
          icon={BarChart3}
          visual={<ReportPreview />}
        />
      </div>

      <PullQuote />
      <PastSessionsSection onStart={handleStart} />
      <Footer />
    </div>
  )
}
