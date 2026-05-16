import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { useState, useEffect, useRef } from 'react'
import { FileText, Mic, BarChart3, ArrowRight, Target, ChevronRight } from 'lucide-react'
import { GlowButton } from '../components/ui/GlowButton'
import { PhaseLabel } from '../components/ui/PhaseLabel'
import { SectionBadge } from '../components/ui/SectionBadge'
import { DifferentiatorBox } from '../components/ui/DifferentiatorBox'
import { WaveformVisualizer } from '../components/ui/WaveformVisualizer'
import { revealVariants, staggerContainer, wordReveal } from '../../lib/motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'

// ── Helpers ────────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, controls } = useScrollReveal()
  return (
    <motion.div ref={ref} animate={controls} initial="hidden" variants={revealVariants} className={className}>
      {children}
    </motion.div>
  )
}

// ── Navbar ─────────────────────────────────────────────────────────────────────

function Navbar({ onStartClick }: { onStartClick: () => void }) {
  return (
    <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(10,10,15,0.80)', backdropFilter: 'blur(12px)', borderColor: '#1E1E2C', height: 56 }}>
      <div className="max-w-6xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rotate-45" />
          <span className="font-sans font-semibold text-h3 text-t1">Interview AI</span>
        </div>
        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Product', 'How it works', 'Past Sessions'].map(l => (
            <a key={l} href={l === 'Past Sessions' ? '#past-sessions' : l === 'How it works' ? '#how-it-works' : '#'} className="text-body text-t2 hover:text-t1 transition-colors">
              {l}
            </a>
          ))}
        </div>
        <GlowButton size="sm" onClick={onStartClick}>Start Interview →</GlowButton>
      </div>
    </nav>
  )
}

// ── Secondary Sticky Nav ───────────────────────────────────────────────────────

function SecondaryNav({ visible, activeSection }: { visible: boolean; activeSection: string }) {
  const sections = ['Entry', 'Interview', 'Report', 'Features', 'Try It']
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="sticky z-40 border-b flex items-center"
          style={{ top: 56, backgroundColor: 'rgba(10,10,15,0.90)', backdropFilter: 'blur(12px)', borderColor: '#1E1E2C', height: 40 }}
        >
          <div className="max-w-6xl mx-auto px-8 flex items-center gap-8 h-full">
            {sections.map(s => (
              <a
                key={s}
                href={`#${s.toLowerCase().replace(' ', '-')}`}
                className={`text-label font-mono uppercase tracking-wide transition-all relative ${activeSection === s.toLowerCase() ? 'text-accent' : 'text-t3 hover:text-t2'}`}
              >
                {s}
                {activeSection === s.toLowerCase() && (
                  <motion.div layoutId="secnav-indicator" className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-accent" />
                )}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero({ onStartClick, onViewSessions }: { onStartClick: () => void; onViewSessions: () => void }) {
  const headline1 = 'The Interview That'.split(' ')
  const headline2 = 'Reads You.'.split(' ')

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-8"
      style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%), #07070C',
      }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-lines opacity-[0.025] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto pt-32">
        {/* Badge */}
        <FadeUp delay={0}>
          <span className="inline-block border border-border rounded-chip px-4 py-1.5 font-mono text-label uppercase tracking-widest text-t3">
            AI INTERVIEW PLATFORM
          </span>
        </FadeUp>

        {/* Headline */}
        <div className="mt-6">
          <div className="flex flex-wrap justify-center gap-x-3">
            {headline1.map((word, i) => (
              <motion.span
                key={i}
                className="text-display-xl font-bold text-t1"
                custom={i}
                variants={wordReveal}
                initial="hidden"
                animate="visible"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 mt-1">
            {headline2.map((word, i) => (
              <motion.span
                key={i}
                className="text-display-xl font-bold"
                custom={headline1.length + i}
                variants={wordReveal}
                initial="hidden"
                animate="visible"
                style={{
                  backgroundImage: 'linear-gradient(to right, #6366F1, #818CF8, #0EA5E9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Subline */}
        <FadeUp delay={0.5} className="mt-5">
          <p className="text-display-md text-t2 font-normal">Resume-aware. Camera-on. Brutally honest.</p>
        </FadeUp>

        <FadeUp delay={0.65} className="mt-3">
          <p className="text-body-lg text-t3">Ten minutes. One verdict. No diplomatic softening.</p>
        </FadeUp>

        {/* CTAs */}
        <FadeUp delay={0.8} className="mt-10 flex gap-4 justify-center flex-wrap">
          <GlowButton size="lg" onClick={onStartClick}>Begin Interview →</GlowButton>
          <GlowButton size="lg" variant="secondary" onClick={onViewSessions}>View Past Sessions</GlowButton>
        </FadeUp>

        {/* Social proof */}
        <FadeUp delay={0.9}>
          <motion.div
            className="mt-8 flex gap-6 justify-center flex-wrap"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {['10 min session', 'AI Interviewer', 'Full Report + PDF'].map((chip, i) => (
              <motion.span
                key={i}
                variants={revealVariants}
                className="bg-bg2 border border-border rounded-chip px-4 py-2 text-body-sm text-t2 font-mono"
              >
                {chip}
              </motion.span>
            ))}
          </motion.div>
        </FadeUp>

        {/* Hero visual */}
        <FadeUp delay={1.0} className="mt-20">
          <motion.div
            className="bg-bg2 border border-border rounded-card-lg p-6 max-w-2xl mx-auto shadow-glow-sm"
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(17,17,24,0.60)' }}
            animate={{ scale: [1, 1.005, 1] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
          >
            <div className="flex items-center justify-between mb-4">
              <SectionBadge variant="time" label="Q3 · Technical" />
              <span className="font-mono text-mono-sm text-warning">07:34</span>
            </div>
            <p className="text-h2 text-t1 text-left mb-4">
              Walk me through how you'd design a rate limiter for a distributed API with 100M requests/day.
            </p>
            <div className="border-t border-border-sub my-4" />
            <div className="flex items-center gap-3">
              <WaveformVisualizer active={true} />
              <span className="text-body-sm text-t3">Listening...</span>
            </div>
            <div className="flex gap-3 mt-4">
              {['138 WPM', 'CONFIDENT', '2 fillers'].map(chip => (
                <span key={chip} className="bg-bg3 border border-border rounded-chip px-3 py-1 font-mono text-mono-sm text-t2">{chip}</span>
              ))}
            </div>
          </motion.div>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Phase Journey ──────────────────────────────────────────────────────────────

function PhaseJourneySection() {
  const { ref, controls } = useScrollReveal()

  const phases = [
    {
      num: '01', phase: 'entry' as const, label: 'PHASE 1 — ENTRY', badge: '~2 min',
      badgeVariant: 'time', color: '#0EA5E9', bg: '#0C1A24', Icon: FileText,
      title: 'Job Selection & Resume Upload',
      body: 'Select your role. Upload your resume. The AI reads it like a suspicious interviewer.',
      features: ['Role-specific question bank', 'Resume landmine detection', 'AI interviewer briefing (eyes only)'],
    },
    {
      num: '02', phase: 'interview' as const, label: 'PHASE 2 — INTERVIEW', badge: 'core experience',
      badgeVariant: 'core experience', color: '#8B5CF6', bg: '#130D1E', Icon: Mic,
      title: 'Live Interview Session',
      body: '10 minutes. Real questions. Your face. Your voice. Silence tracked.',
      features: ['Adaptive question flow', 'Real-time emotion detection', 'Pre-answer gap captured'],
    },
    {
      num: '03', phase: 'report' as const, label: 'PHASE 3 — REPORT', badge: 'the wow moment',
      badgeVariant: 'the wow moment', color: '#10B981', bg: '#0A1A14', Icon: BarChart3,
      title: 'Post-Session Analysis',
      body: 'Nervousness heatmap. Voice graph. Question breakdown. One honest verdict.',
      features: ['Confidence vs accuracy split', 'Shadow questions', 'Improvement plan'],
    },
  ]

  return (
    <section id="how-it-works" className="py-32 max-w-6xl mx-auto px-8">
      <RevealSection>
        <PhaseLabel text="THE JOURNEY" showLine />
        <h2 className="text-display-md text-t1 mt-2 font-bold">Three Phases. One Verdict.</h2>
        <p className="text-body-lg text-t2 mt-3 mb-16">From resume to debrief in 12 minutes.</p>
      </RevealSection>

      <motion.div
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={staggerContainer}
        className="grid grid-cols-3 gap-6"
      >
        {phases.map((p, i) => (
          <motion.div
            key={p.num}
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 } }
            }}
            className="relative rounded-card border overflow-hidden flex flex-col group cursor-pointer transition-all duration-200"
            style={{ backgroundColor: p.bg, borderColor: `${p.color}20`, minHeight: 380 }}
            whileHover={{ borderColor: `${p.color}60` } as any}
          >
            {/* Top border */}
            <div className="h-0.5 w-full" style={{ backgroundColor: p.color }} />

            {/* Badge */}
            <div className="absolute top-4 right-4">
              <SectionBadge variant={p.badgeVariant} label={p.badge} />
            </div>

            <div className="p-6 flex flex-col flex-1">
              {/* Phase label */}
              <p className="font-mono text-label uppercase tracking-[0.09em]" style={{ color: p.color }}>{p.label}</p>

              {/* Icon */}
              <p.Icon size={32} className="mt-8" style={{ color: p.color }} />

              {/* Title */}
              <h3 className="text-h1 text-t1 font-semibold mt-4">{p.title}</h3>

              {/* Body */}
              <p className="text-body text-t2 mt-2">{p.body}</p>

              {/* Features */}
              <ul className="mt-4 flex flex-col gap-1.5 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-body-sm text-t2">
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Step number */}
              <span className="self-end font-mono text-display-lg font-bold mt-2" style={{ color: `${p.color}20` }}>
                {p.num}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

// ── Differentiator ─────────────────────────────────────────────────────────────

function DifferentiatorSection() {
  return (
    <section id="entry" className="py-24 max-w-3xl mx-auto px-8 text-center">
      <DifferentiatorBox
        size="lg"
        label="THE THING NOBODY ELSE DOES"
        text={'The AI watches your face for 2 seconds before you answer.\nThat\'s where the real nervousness lives.\nThat gap gets its own section in the report.'}
        bullets={[
          'No server. Entirely browser-native processing.',
          'Baseline-calibrated. Your normal = the reference.',
          'The silence is the data.',
        ]}
      />
    </section>
  )
}

// ── Feature Sections ───────────────────────────────────────────────────────────

function ResumeSection() {
  const { ref, controls } = useScrollReveal()
  return (
    <section id="features" className="py-24 border-y border-border-sub" style={{ backgroundColor: '#111118' }}>
      <div className="max-w-6xl mx-auto px-8">
        <motion.div ref={ref} animate={controls} initial="hidden" variants={staggerContainer} className="grid grid-cols-2 gap-16 items-center">
          <motion.div variants={revealVariants}>
            <PhaseLabel phase="entry" text="PHASE 1 — RESUME INTELLIGENCE" />
            <h2 className="text-display-md text-t1 font-bold mt-3">AI Reads Your Resume Like a Suspicious Interviewer</h2>
            <p className="text-body-lg text-t2 mt-4 leading-relaxed">
              It doesn't look for strengths. It looks for gaps, vague claims, and things you put in hoping nobody asks about.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                'Extracts top 5 verifiable skills',
                "Identifies 3 'resume landmines' to probe",
                'Generates candidate briefing — hidden from you',
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-body text-t2">
                  <span className="w-1.5 h-1.5 rounded-full bg-phase-entry flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <DifferentiatorBox
                text="The briefing the AI generates before your interview? You never see it. That's intentional."
              />
            </div>
          </motion.div>

          <motion.div variants={revealVariants}>
            <div className="bg-bg3 border border-border rounded-card p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-label font-mono text-success uppercase tracking-wider mb-3">Strengths</p>
                  {['React & TypeScript expertise', 'Strong systems design background', 'Measurable impact in past roles'].map(s => (
                    <div key={s} className="flex items-start gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0 mt-1.5" />
                      <span className="text-body-sm text-t2">{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-label font-mono text-warning uppercase tracking-wider mb-3">Areas We'll Explore</p>
                  {['Scalability at 10M+ users', 'Database optimization claims', 'Team lead experience gap'].map(s => (
                    <div key={s} className="flex items-start gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0 mt-1.5" />
                      <span className="text-body-sm text-t2">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border-sub mt-4 pt-3">
                <p className="text-label font-mono text-t3 text-center">AI Briefing Generated — Eyes Only</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function InterviewSection() {
  const { ref, controls } = useScrollReveal()
  return (
    <section id="interview" className="py-24" style={{ backgroundColor: '#0A0A0F' }}>
      <div className="max-w-6xl mx-auto px-8">
        <motion.div ref={ref} animate={controls} initial="hidden" variants={staggerContainer} className="grid grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <motion.div variants={revealVariants}>
            <div className="rounded-card-lg border border-border overflow-hidden aspect-video bg-bg3 relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
                    <div className="absolute w-11 h-11 rounded-full opacity-12 bg-phase-interview" />
                    <div className="absolute w-7 h-7 rounded-full opacity-35 bg-phase-interview" />
                    <div className="w-3.5 h-3.5 rounded-full bg-phase-interview" />
                  </div>
                  <p className="text-label font-mono text-t3">ENGAGED</p>
                </div>
              </div>
              {/* Live badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {['142 WPM', '±18Hz', '3 fillers'].map(m => (
                  <div key={m} className="bg-bg0/90 backdrop-blur-sm border border-border/50 rounded-chip px-3 py-1.5">
                    <span className="font-mono text-mono-sm text-t1">{m}</span>
                  </div>
                ))}
              </div>
              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center px-4 gap-3 border-t border-border-sub/50" style={{ backgroundColor: 'rgba(7,7,12,0.85)', backdropFilter: 'blur(8px)' }}>
                <WaveformVisualizer active={true} />
                <span className="font-mono text-mono-sm text-t2 truncate">So the way I would approach this...</span>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div variants={revealVariants}>
            <PhaseLabel phase="interview" text="PHASE 2 — LIVE SESSION" />
            <h2 className="text-display-md text-t1 font-bold mt-3">A Real Interviewer. In Your Browser.</h2>
            <p className="text-body-lg text-t2 mt-4 leading-relaxed">
              Adaptive questions. 4-second silences that are tracked. Your face before your words. It's deliberately uncomfortable.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function ReportSection() {
  const { ref, controls } = useScrollReveal()
  return (
    <section id="report" className="py-24 border-y border-border-sub" style={{ backgroundColor: '#111118' }}>
      <div className="max-w-6xl mx-auto px-8">
        <motion.div ref={ref} animate={controls} initial="hidden" variants={staggerContainer} className="grid grid-cols-2 gap-16 items-center">
          <motion.div variants={revealVariants}>
            <PhaseLabel phase="report" text="PHASE 3 — THE REPORT" />
            <h2 className="text-display-md text-t1 font-bold mt-3">A Report That Doesn't Lie</h2>
            <p className="text-body-lg text-t2 mt-4 leading-relaxed">
              Not a score. A verdict. With a paragraph of real recruiter-voice feedback.
            </p>
            <div className="mt-6 p-5 bg-bg3 border border-border rounded-card">
              <p className="text-h2 italic text-t1 leading-[1.5]">
                "You sounded most confident on the question you answered least accurately."
              </p>
              <p className="text-label text-t3 mt-2 font-mono">— AI Interviewer, Software Engineer Session</p>
            </div>
          </motion.div>

          <motion.div variants={revealVariants}>
            {/* Mini heatmap */}
            <div className="bg-bg3 border border-border rounded-card p-5 mb-4">
              <p className="text-label font-mono text-t3 mb-3">NERVOUSNESS HEATMAP</p>
              <div className="h-12 flex items-end gap-0.5 overflow-hidden rounded">
                {Array.from({ length: 80 }, (_, i) => {
                  const stress = Math.sin(i * 0.15) * 0.5 + Math.random() * 0.3 + 0.2
                  const color = stress > 0.7 ? 'rgba(239,68,68,0.85)' : stress > 0.4 ? 'rgba(245,158,11,0.60)' : 'rgba(99,102,241,0.20)'
                  return <div key={i} className="flex-1 rounded-sm" style={{ backgroundColor: color, height: `${Math.min(100, stress * 100)}%` }} />
                })}
              </div>
            </div>
            {/* Verdict badge */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-3 rounded-card-lg border-2 px-8 py-4" style={{ borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.10)', boxShadow: '0 0 40px -8px rgba(34,197,94,0.5)' }}>
                <span className="font-mono text-display-md font-bold text-hire">HIRE</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Tech Marquee ───────────────────────────────────────────────────────────────

function TechMarquee() {
  const chips = [
    'Google Gemini 1.5 Flash', 'Web Speech API', 'face-api.js', 'Web Audio API',
    'MediaRecorder API', 'ffmpeg.wasm', 'pdf-lib', 'IndexedDB',
    'Browser-Native TTS', 'No Server Required', 'Groq LLaMA 3.3',
  ]
  const doubled = [...chips, ...chips]

  return (
    <section className="py-16 border-y border-border-sub overflow-hidden">
      <p className="text-label font-mono text-t3 text-center mb-6 uppercase tracking-widest">POWERED BY</p>
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((chip, i) => (
          <span
            key={i}
            className="inline-block bg-bg2 border border-border rounded-chip px-4 py-2 font-mono text-mono-sm text-t3 mx-1.5 flex-shrink-0"
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  )
}

// ── Past Sessions ──────────────────────────────────────────────────────────────

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
    HIRE: { border: '#22C55E', bg: 'rgba(34,197,94,0.10)', text: '#22C55E' },
    BORDERLINE: { border: '#F59E0B', bg: 'rgba(245,158,11,0.10)', text: '#F59E0B' },
    'NO HIRE': { border: '#EF4444', bg: 'rgba(239,68,68,0.10)', text: '#EF4444' },
  }

  return (
    <section id="past-sessions" className="py-24 max-w-6xl mx-auto px-8">
      <RevealSection>
        <PhaseLabel text="PAST SESSIONS" showLine />
        <h2 className="text-display-md text-t1 font-bold mt-2">Your History</h2>
      </RevealSection>

      <div className="mt-12">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-bg3 rounded-card p-5 animate-pulse">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-8 bg-bg4 rounded-chip" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-bg4 rounded w-1/3" />
                    <div className="h-3 bg-bg4 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <Target size={48} className="text-t4 mx-auto mb-4" />
            <h3 className="text-h2 text-t3">No sessions yet.</h3>
            <p className="text-body text-t3 italic mt-2">Your first reckoning awaits.</p>
            <div className="mt-6">
              <GlowButton size="md" onClick={onStart}>Start Your First Interview →</GlowButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.slice(0, 5).map((s: any) => {
              const verdict = s.verdict || 'BORDERLINE'
              const vc = verdictColors[verdict as keyof typeof verdictColors] || verdictColors['BORDERLINE']
              const metrics = typeof s.metrics === 'string' ? JSON.parse(s.metrics) : (s.metrics || {})
              return (
                <motion.div
                  key={s.id}
                  className="bg-bg2 border border-border rounded-card p-5 flex items-center gap-6 cursor-pointer hover:bg-bg3 transition-all duration-200"
                  whileHover={{ borderColor: 'rgba(99,102,241,0.40)' } as any}
                >
                  <span
                    className="inline-flex rounded-chip px-4 py-1.5 text-label font-mono font-bold uppercase border flex-shrink-0"
                    style={{ borderColor: vc.border, backgroundColor: vc.bg, color: vc.text }}
                  >
                    {verdict}
                  </span>
                  <div className="flex-1">
                    <p className="text-h3 text-t1 font-semibold">{s.jobRole}</p>
                    <p className="text-mono-sm text-t3 font-mono mt-0.5">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {['overall', 'confidence', 'stress'].map(k => (
                        <span key={k} className="bg-bg3 border border-border rounded-chip px-2 py-0.5 font-mono text-mono-sm text-t2 capitalize">
                          {k}: {metrics[k] ?? '—'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <GlowButton size="sm" variant="secondary" onClick={() => setLocation(`/report?id=${s.id}`)}>
                    View Report →
                  </GlowButton>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border-sub py-12 px-8" style={{ backgroundColor: '#07070C' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-accent rotate-45" />
              <span className="font-sans font-semibold text-h3 text-t1">Interview AI</span>
            </div>
            <p className="text-body text-t3">An AI interview platform for engineers.</p>
          </div>
          <div className="flex flex-col gap-2">
            {['Product', 'How it works', 'Past Sessions'].map(l => (
              <a key={l} href="#" className="text-body text-t3 hover:text-t2 transition-colors">{l}</a>
            ))}
          </div>
          <div>
            <p className="font-mono text-mono-sm text-t3">Built with: Gemini · React · face-api.js</p>
          </div>
        </div>
        <div className="border-t border-border-sub pt-6">
          <p className="font-mono text-mono-sm text-t4 text-center">© 2025 Interview AI · Desktop only · Free to use</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Landing() {
  const [, setLocation] = useLocation()
  const [showSecondaryNav, setShowSecondaryNav] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowSecondaryNav(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleStart = () => setLocation('/setup')
  const handleViewSessions = () => {
    document.getElementById('past-sessions')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-bg0 min-h-screen">
      <Navbar onStartClick={handleStart} />
      <SecondaryNav visible={showSecondaryNav} activeSection={activeSection} />
      <Hero onStartClick={handleStart} onViewSessions={handleViewSessions} />
      <PhaseJourneySection />
      <DifferentiatorSection />
      <ResumeSection />
      <InterviewSection />
      <ReportSection />
      <TechMarquee />
      <PastSessionsSection onStart={handleStart} />
      <Footer />
    </div>
  )
}
