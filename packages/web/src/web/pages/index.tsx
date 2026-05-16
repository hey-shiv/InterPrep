import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { useState, useEffect, useRef } from 'react'
import { FileText, Mic, BarChart3, Target } from 'lucide-react'
import { GlowButton } from '../components/ui/GlowButton'
import { PhaseLabel } from '../components/ui/PhaseLabel'
import { SectionBadge } from '../components/ui/SectionBadge'
import { DifferentiatorBox } from '../components/ui/DifferentiatorBox'
import { WaveformVisualizer } from '../components/ui/WaveformVisualizer'
import { revealVariants, staggerContainer, wordReveal } from '../../lib/motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
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
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderColor: '#1e1e1e', height: 56 }}
    >
      <div className="max-w-6xl mx-auto px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-accent rotate-45" />
          <span className="font-serif text-h3 text-t1" style={{ fontStyle: 'normal', fontWeight: 700, letterSpacing: '-0.01em' }}>InterPrep</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['How it works', 'Past Sessions'].map(l => (
            <a key={l} href={l === 'Past Sessions' ? '#past-sessions' : '#how-it-works'} className="text-body text-t2 hover:text-t1 transition-colors" style={{ fontFamily: 'DM Sans' }}>
              {l}
            </a>
          ))}
        </div>
        <GlowButton size="sm" onClick={onStartClick}>Start Interview →</GlowButton>
      </div>
    </nav>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero({ onStartClick, onViewSessions }: { onStartClick: () => void; onViewSessions: () => void }) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 border-b"
      style={{
        background: '#0a0a0a',
        borderColor: '#1e1e1e',
      }}
    >
      {/* Subtle noise grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url(/noise.png)', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

      <div className="relative max-w-4xl mx-auto pt-24 pb-32">
        {/* Eyebrow */}
        <FadeUp delay={0}>
          <span className="inline-block border border-border rounded-chip px-4 py-1.5 font-mono text-label uppercase tracking-widest text-t3">
            AI Interview Platform
          </span>
        </FadeUp>

        {/* Headline — Playfair serif */}
        <FadeUp delay={0.1} className="mt-6">
          <h1 className="font-serif text-t1" style={{ fontSize: 'clamp(2.5rem, 7vw, 6.5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', fontWeight: 800 }}>
            The Interview<br />
            <em style={{ color: '#5c4fff' }}>That Reads You.</em>
          </h1>
        </FadeUp>

        {/* Sub */}
        <FadeUp delay={0.25} className="mt-6">
          <p className="text-body-lg text-t2 max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
            Resume-aware. Camera-on. Brutally honest.<br />
            Ten minutes. One verdict. No diplomatic softening.
          </p>
        </FadeUp>

        {/* CTAs */}
        <FadeUp delay={0.4} className="mt-10 flex gap-4 justify-center flex-wrap">
          <GlowButton size="lg" onClick={onStartClick}>Begin Interview →</GlowButton>
          <GlowButton size="lg" variant="secondary" onClick={onViewSessions}>View Past Sessions</GlowButton>
        </FadeUp>

        {/* Chips */}
        <FadeUp delay={0.55}>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            {['10 min session', 'AI Interviewer', 'Full Report + PDF', 'Camera Required'].map(chip => (
              <span key={chip} className="bg-bg2 border border-border px-4 py-2 text-body-sm text-t3 font-mono" style={{ borderRadius: 2 }}>
                {chip}
              </span>
            ))}
          </div>
        </FadeUp>

        {/* Hero visual — mock interview card */}
        <FadeUp delay={0.7} className="mt-20">
          <div
            className="bg-bg2 border border-border max-w-2xl mx-auto p-6"
            style={{ borderRadius: 2, borderTop: '2px solid #5c4fff' }}
          >
            <div className="flex items-center justify-between mb-4">
              <SectionBadge variant="time" label="Q3 · Technical" />
              <span className="font-mono text-mono-sm text-warning">07:34</span>
            </div>
            <p className="text-h2 text-t1 text-left mb-4" style={{ fontFamily: 'DM Sans' }}>
              Walk me through how you'd design a rate limiter for a distributed API with 100M requests/day.
            </p>
            <div className="border-t border-border-sub my-4" />
            <div className="flex items-center gap-3">
              <WaveformVisualizer active={true} />
              <span className="text-body-sm text-t3">Listening...</span>
            </div>
            <div className="flex gap-3 mt-4">
              {['138 WPM', 'CONFIDENT', '2 fillers'].map(chip => (
                <span key={chip} className="bg-bg3 border border-border px-3 py-1 font-mono text-mono-sm text-t2" style={{ borderRadius: 2 }}>{chip}</span>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Marquee ticker ─────────────────────────────────────────────────────────────

function Ticker({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="border-y border-border-sub overflow-hidden py-3" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 mx-6 font-mono text-mono-sm text-t3 flex-shrink-0">
            <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Phase chapters ─────────────────────────────────────────────────────────────

function PhaseChapter({
  num, phaseLabel, title, body, features, accentColor, icon: Icon, visual, reverse = false
}: {
  num: string; phaseLabel: string; title: string; body: string; features: string[];
  accentColor: string; icon: any; visual: React.ReactNode; reverse?: boolean
}) {
  const { ref, controls } = useScrollReveal()
  return (
    <section
      id={`phase-${num}`}
      className="py-28 border-b"
      style={{ borderColor: '#1e1e1e', backgroundColor: num === '02' ? '#0d0d0d' : '#0a0a0a' }}
    >
      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          ref={ref} animate={controls} initial="hidden"
          variants={staggerContainer}
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center ${reverse ? 'md:[direction:rtl]' : ''}`}
        >
          <motion.div variants={revealVariants} style={{ direction: 'ltr' }}>
            <span className="font-mono text-label uppercase tracking-widest" style={{ color: accentColor }}>{num} —</span>
            <p className="font-mono text-label uppercase tracking-widest mt-1" style={{ color: accentColor }}>{phaseLabel}</p>
            <h2 className="font-serif text-t1 mt-4" style={{ fontSize: '2.5rem', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {title}
            </h2>
            <p className="text-body-lg text-t2 mt-4" style={{ lineHeight: 1.75 }}>{body}</p>
            <ul className="mt-6 flex flex-col gap-2">
              {features.map(f => (
                <li key={f} className="flex items-center gap-3 text-body text-t2">
                  <span className="w-1 h-1 flex-shrink-0" style={{ backgroundColor: accentColor, borderRadius: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={revealVariants} style={{ direction: 'ltr' }} className="w-full">
            {visual}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Pull quote ─────────────────────────────────────────────────────────────────

function PullQuote() {
  return (
    <section className="py-24 border-b" style={{ borderColor: '#1e1e1e', backgroundColor: '#0d0d0d' }}>
      <div className="max-w-3xl mx-auto px-8 text-center">
        <RevealSection>
          <p className="font-mono text-label uppercase tracking-widest text-t3 mb-6">The Differentiator</p>
          <blockquote className="font-serif italic text-t1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: 1.35, fontWeight: 700 }}>
            "The AI watches your face for 2 seconds before you answer. That's where the real nervousness lives."
          </blockquote>
          <p className="font-mono text-mono-sm text-t3 mt-6">— Built into every question. Not optional.</p>
          <div className="mt-8 flex gap-3 justify-center">
            {['No server', 'Browser-native', 'Baseline-calibrated', 'The silence is data'].map(b => (
              <span key={b} className="bg-bg3 border border-border px-3 py-1.5 font-mono text-mono-sm text-t3" style={{ borderRadius: 2 }}>
                {b}
              </span>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  )
}

// ── Past sessions ──────────────────────────────────────────────────────────────

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
    <section id="past-sessions" className="py-24 border-b" style={{ borderColor: '#1e1e1e' }}>
      <div className="max-w-5xl mx-auto px-8">
        <RevealSection>
          <PhaseLabel text="PAST SESSIONS" showLine />
          <h2 className="font-serif text-t1 mt-3" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Your History</h2>
        </RevealSection>

        <div className="mt-12">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-bg2 border border-border p-5 animate-pulse" style={{ borderRadius: 2 }}>
                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-8 bg-bg3 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-bg3 rounded w-1/3" />
                      <div className="h-3 bg-bg3 rounded w-1/4" />
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
                    className="bg-bg2 border border-border p-5 flex items-center gap-6 cursor-pointer hover:bg-bg3 transition-all"
                    style={{ borderRadius: 2 }}
                    whileHover={{ borderColor: 'rgba(92,79,255,0.40)' } as any}
                  >
                    <span
                      className="inline-flex px-4 py-1.5 text-label font-mono font-bold uppercase border flex-shrink-0"
                      style={{ borderRadius: 2, borderColor: vc.border, backgroundColor: vc.bg, color: vc.text }}
                    >
                      {verdict}
                    </span>
                    <div className="flex-1">
                      <p className="text-h3 text-t1 font-semibold">{s.jobRole}</p>
                      <p className="text-mono-sm text-t3 font-mono mt-0.5">
                        {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
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
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border-sub py-12 px-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-accent rotate-45" />
          <span className="font-serif text-h3 text-t1" style={{ fontWeight: 700 }}>InterPrep</span>
        </div>
        <p className="font-mono text-mono-sm text-t4">© 2025 · Free to use · Desktop only</p>
        <p className="font-mono text-mono-sm text-t3">Groq · React · face-api.js</p>
      </div>
    </footer>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Landing() {
  const [, setLocation] = useLocation()

  const handleStart = () => setLocation('/setup')
  const handleViewSessions = () => {
    document.getElementById('past-sessions')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-bg0 min-h-screen">
      <Navbar onStartClick={handleStart} />

      <Hero onStartClick={handleStart} onViewSessions={handleViewSessions} />

      <Ticker items={[
        'Resume Intelligence', '4-Second Silence Tracking', 'Nervousness Heatmap',
        'Voice Pitch Analysis', 'Confidence vs Accuracy', 'Shadow Questions',
        'Improvement Plan', 'Groq LLaMA 3.3', 'Browser-Native', 'No Server Required',
      ]} />

      {/* Phase 01 */}
      <PhaseChapter
        num="01" phaseLabel="Entry — Resume Intelligence" accentColor="#0EA5E9"
        title={"The AI reads your resume like a suspicious interviewer."}
        body="It doesn't look for strengths. It looks for gaps, vague claims, and things you put in hoping nobody asks about. Then it briefs itself — without showing you."
        features={["Extracts top 5 verifiable skills", "Identifies 3 'resume landmines' to probe", "Generates candidate briefing — hidden from you"]}
        icon={FileText}
        visual={
          <div className="bg-bg2 border border-border p-5" style={{ borderRadius: 2, borderTop: '2px solid #0EA5E9' }}>
            <p className="font-mono text-label uppercase tracking-wider text-phase-entry mb-4">AI Briefing — Eyes Only</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-label font-mono text-success uppercase mb-3">Strengths</p>
                {['React & TypeScript', 'Systems design background', 'Measurable impact'].map(s => (
                  <div key={s} className="flex items-start gap-2 mb-2">
                    <span className="w-1 h-1 bg-success flex-shrink-0 mt-2" />
                    <span className="text-body-sm text-t2">{s}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-label font-mono text-warning uppercase mb-3">Will Probe</p>
                {['Scalability at 10M+ users', 'DB optimization claims', 'Team lead experience'].map(s => (
                  <div key={s} className="flex items-start gap-2 mb-2">
                    <span className="w-1 h-1 bg-warning flex-shrink-0 mt-2" />
                    <span className="text-body-sm text-t2">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border-sub mt-4 pt-3">
              <p className="text-label font-mono text-t3 italic text-center">The interviewer has read your file.</p>
            </div>
          </div>
        }
      />

      <Ticker items={[
        'Adaptive question flow', 'Emotion detection', 'Pre-answer gap measured',
        'Real-time filler counting', 'Voice stress baseline', 'Face detected before words',
      ]} />

      {/* Phase 02 */}
      <PhaseChapter
        num="02" phaseLabel="Interview — Live Session" accentColor="#8B5CF6"
        title={"10 minutes. Real questions. Your face."}
        body="Adaptive questions built from your resume. 4-second silence tracked before you speak. Your emotion captured before your words. Deliberately uncomfortable."
        features={["Question flow adapts to your answers", "Real-time WPM, pitch, filler tracking", "Pre-answer gap captured per question"]}
        icon={Mic}
        visual={
          <div className="bg-bg2 border border-border overflow-hidden aspect-video relative" style={{ borderRadius: 2, borderTop: '2px solid #8B5CF6' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg3">
              <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
                <div className="absolute w-11 h-11 rounded-full opacity-10 bg-phase-interview" />
                <div className="absolute w-7 h-7 rounded-full opacity-30 bg-phase-interview" />
                <div className="w-3.5 h-3.5 rounded-full bg-phase-interview" />
              </div>
              <p className="text-label font-mono text-t3 mt-3">ENGAGED</p>
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {['142 WPM', '±18Hz', '3 fillers'].map(m => (
                <div key={m} className="bg-bg0/90 border border-border px-3 py-1" style={{ borderRadius: 2 }}>
                  <span className="font-mono text-mono-sm text-t1">{m}</span>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center px-4 gap-3 border-t border-border-sub/50" style={{ backgroundColor: 'rgba(10,10,10,0.90)', backdropFilter: 'blur(8px)' }}>
              <WaveformVisualizer active={true} />
              <span className="font-mono text-mono-sm text-t2 truncate">So the way I would approach this...</span>
            </div>
          </div>
        }
        reverse
      />

      <Ticker items={[
        'HIRE verdict', 'BORDERLINE verdict', 'NO HIRE verdict',
        'Nervousness heatmap', 'Confidence vs accuracy', 'Shadow questions',
        'Improvement plan', 'PDF download', 'Session recording',
      ]} />

      {/* Phase 03 */}
      <PhaseChapter
        num="03" phaseLabel="Report — The Verdict" accentColor="#10B981"
        title={"A report that doesn't lie."}
        body="Not a score. A verdict. With a paragraph of real recruiter-voice feedback, a nervousness heatmap, shadow questions you didn't get asked, and an improvement plan."
        features={["Confidence vs accuracy scatter plot", "3 shadow questions you must prep", "Improvement plan with timelines"]}
        icon={BarChart3}
        visual={
          <div className="flex flex-col gap-3">
            <div className="bg-bg2 border border-border p-5" style={{ borderRadius: 2 }}>
              <p className="text-label font-mono text-t3 mb-3">NERVOUSNESS HEATMAP</p>
              <div className="h-10 flex items-end gap-px overflow-hidden">
                {Array.from({ length: 120 }, (_, i) => {
                  const stress = Math.sin(i * 0.15) * 0.5 + Math.random() * 0.3 + 0.2
                  const color = stress > 0.7 ? 'rgba(239,68,68,0.85)' : stress > 0.4 ? 'rgba(245,158,11,0.60)' : 'rgba(92,79,255,0.20)'
                  return <div key={i} className="flex-1" style={{ backgroundColor: color, height: `${Math.min(100, stress * 100)}%` }} />
                })}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-3 border-2 px-8 py-4" style={{ borderRadius: 2, borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.08)', boxShadow: '0 0 40px -8px rgba(34,197,94,0.4)' }}>
                <span className="font-mono text-display-md font-bold text-hire">HIRE</span>
              </div>
            </div>
            <div className="bg-bg2 border border-border p-4" style={{ borderRadius: 2, borderLeft: '3px solid #10B981' }}>
              <p className="text-body text-t1 italic" style={{ fontFamily: 'Playfair Display', lineHeight: 1.5 }}>
                "You sounded most confident on the question you answered least accurately."
              </p>
              <p className="text-label text-t3 mt-2 font-mono">— AI Interviewer</p>
            </div>
          </div>
        }
      />

      <PullQuote />
      <PastSessionsSection onStart={handleStart} />
      <Footer />
    </div>
  )
}
