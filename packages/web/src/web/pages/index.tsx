import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  Mic,
  Play,
  Radar,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react'
import { Brand, EditionBadge, InterPrepMark, StartButton } from '../components/brand'

type Session = {
  id: string
  jobRole?: string
  roleTitle?: string
  verdict?: 'HIRE' | 'BORDERLINE' | 'NO HIRE'
  metrics?: string | Record<string, number | string>
  createdAt?: string
}

const chapters = [
  ['I', 'Brief'],
  ['II', 'Baseline'],
  ['III', 'Interview'],
  ['IV', 'Report'],
]

function Topbar({ onStart }: { onStart: () => void }) {
  return (
    <header className="edition-topbar">
      <nav className="edition-nav">
        <Brand />
        <div className="nav-links">
          <a className="nav-link" href="#brief">Briefing</a>
          <a className="nav-link" href="#room">Room</a>
          <a className="nav-link" href="#report">Report</a>
          <a className="nav-link" href="#sessions">History</a>
        </div>
        <StartButton onClick={onStart} />
      </nav>
    </header>
  )
}

function HeroStage() {
  const bars = [32, 54, 72, 48, 82, 38, 64, 76, 44, 58, 88, 50, 40, 70]

  return (
    <div className="hero-stage" aria-hidden="true">
      <div className="edition-word">The<br />Interview<br />Edition</div>
      <div className="product-orbit" />

      <div className="mock-window dark hero-interview-card">
        <div className="mock-window-header">
          <span>Live interview room</span>
          <span>07:34</span>
        </div>
        <div className="mock-question">
          <span className="chip"><Timer size={13} /> Q3 system design</span>
          <h3>Design a rate limiter for a distributed API with 100M requests per day.</h3>
          <p>InterPrep waits through the silence, listens to the answer, and scores the tradeoffs after the round.</p>
        </div>
        <div className="trace-bars">
          {bars.map((height, index) => <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }} />)}
        </div>
      </div>

      <div className="mock-window hero-report-card">
        <div className="mock-window-header">
          <span>Verdict board</span>
          <span>Complete</span>
        </div>
        <div className="verdict-strip">
          <div><strong>7.8</strong><span>Structure</span></div>
          <div><strong>6.4</strong><span>Depth</span></div>
          <div><strong>2.4s</strong><span>Gap</span></div>
        </div>
        <div className="px-5 pb-5">
          <p className="font-serif text-3xl leading-none text-[#171813]">"Confident, but one answer outran the evidence."</p>
        </div>
      </div>

      <div className="mock-window hero-brief-card">
        <div className="mock-window-header">
          <span>Resume intelligence</span>
          <InterPrepMark className="text-[#303429]" />
        </div>
        <div className="brief-list">
          <span>React + TypeScript <b>strong</b></span>
          <span>Scale claims <b>probe</b></span>
          <span>Ownership story <b>missing</b></span>
        </div>
      </div>
    </div>
  )
}

function ChapterRail() {
  return (
    <div className="chapter-rail">
      {chapters.map(([num, label]) => (
        <a key={label} href={`#${label.toLowerCase()}`}>
          <i>{num}</i>
          <span>{label}</span>
        </a>
      ))}
    </div>
  )
}

function StickyChapterRail() {
  return (
    <aside className="chapter-rail-fixed">
      {chapters.map(([num, label]) => (
        <a key={label} href={`#${label.toLowerCase()}`}>
          <span>{num}</span>
          <strong>{label}</strong>
        </a>
      ))}
    </aside>
  )
}

function ResumeMap() {
  return (
    <div className="resume-map">
      {[
        ['Strength', 'React + TypeScript shipped across product teams', 'keep'],
        ['Evidence gap', 'Claims "10M+ users" without latency or ownership detail', 'probe'],
        ['Risk', 'No story for failed launch or rollback decision', 'ask'],
        ['Follow-up', 'Explain indexing tradeoff under write-heavy load', 'Q2'],
      ].map(([type, detail, action]) => (
        <div className="resume-row" key={detail}>
          <strong>{type}</strong>
          <span>{detail}</span>
          <span className="chip text-t3">{action}</span>
        </div>
      ))}
    </div>
  )
}

function LiveRoom() {
  const bars = [40, 66, 52, 80, 72, 35, 46, 90, 60, 44, 76, 58]

  return (
    <div className="live-room">
      <div className="mock-window-header">
        <span>Interview room</span>
        <span>Question 03 / 06</span>
      </div>
      <div className="live-room-main">
        <div className="live-question">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="chip"><span className="status-dot bad pulse-dot" /> Live</span>
              <span className="chip"><Mic size={13} /> listening</span>
              <span className="chip">4s composure window</span>
            </div>
            <h3 className="mt-8">Walk through the tradeoffs, then defend your fallback plan.</h3>
          </div>
          <div>
            <p className="eyebrow">Transcript</p>
            <p className="body mt-2 text-t1">"I would start with a token bucket at the edge, then make the policy configurable per tenant..."</p>
          </div>
        </div>
        <div className="live-aside">
          <div className="camera-placeholder">
            <div className="face-frame" />
          </div>
          <div className="metric"><p className="metric-value text-success">138</p><p className="metric-label">WPM</p></div>
          <div className="metric"><p className="metric-value text-warning">2.4s</p><p className="metric-label">Response gap</p></div>
        </div>
      </div>
      <div className="trace-bars">
        {bars.map((height, index) => <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 75}ms` }} />)}
      </div>
    </div>
  )
}

function ReportBoard() {
  const heights = [48, 62, 78, 54, 42, 86, 70, 92, 58, 46, 76, 64]

  return (
    <div className="report-board">
      <div className="report-board-grid">
        <div className="report-verdict">
          <div>
            <p className="metric-label text-t3">Verdict</p>
            <strong>HIRE<br />READY</strong>
          </div>
        </div>
        <div className="report-chart">
          {heights.map((height, index) => (
            <span key={index} style={{ height: `${height}%`, background: index > 4 && index < 8 ? '#b8ff5c' : '#303429' }} />
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="proof-card"><h3>Best moment</h3><p>Q3 architecture answer had clean sequencing.</p></div>
        <div className="proof-card"><h3>Shadow question</h3><p>What metric proves the biggest claim?</p></div>
        <div className="proof-card"><h3>Next drill</h3><p>Replay weak answers with numbers first.</p></div>
      </div>
    </div>
  )
}

function ProofCard({ icon: Icon, title, copy }: { icon: LucideIcon; title: string; copy: string }) {
  return (
    <motion.div
      className="proof-card"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <Icon size={22} />
      <h3 className="mt-5">{title}</h3>
      <p>{copy}</p>
    </motion.div>
  )
}

function RecentSessions({ onStart }: { onStart: () => void }) {
  const [, setLocation] = useLocation()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="sessions" className="edition-section light-section">
      <div className="edition-grid">
        <StickyChapterRail />
        <div>
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Session archive</p>
              <h2 className="serif-title mt-3">Your practice history.</h2>
            </div>
            <button className="btn btn-secondary text-[#191b14]" onClick={onStart}>
              New Session <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="session-card p-6 body">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="session-card grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-2xl font-bold">No practice rounds yet.</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5d5f55]">Start one interview and this area becomes your progress log.</p>
              </div>
              <button className="btn btn-primary" onClick={onStart}>
                Start First Interview <Play size={16} />
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {sessions.slice(0, 5).map(session => {
                const metrics = typeof session.metrics === 'string' ? safeMetrics(session.metrics) : (session.metrics || {})
                const verdict = session.verdict || 'BORDERLINE'
                return (
                  <button
                    key={session.id}
                    className="session-card grid gap-4 p-5 text-left md:grid-cols-[150px_1fr_auto] md:items-center"
                    onClick={() => setLocation(`/report?id=${session.id}`)}
                  >
                    <span className={`chip ${verdict === 'HIRE' ? 'text-success' : verdict === 'NO HIRE' ? 'text-danger' : 'text-warning'}`}>
                      {verdict}
                    </span>
                    <span>
                      <strong className="block text-lg">{session.jobRole || session.roleTitle || 'Interview session'}</strong>
                      <span className="text-[15px] text-[#5d5f55]">
                        {session.createdAt ? new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        {metrics.overall ? ` - Score ${metrics.overall}/10` : ''}
                      </span>
                    </span>
                    <span className="btn btn-secondary text-[#191b14]">View Report <ArrowRight size={15} /></span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const [, setLocation] = useLocation()
  const start = () => setLocation('/setup')

  return (
    <div className="edition-page">
      <Topbar onStart={start} />

      <main>
        <section className="edition-hero">
          <div className="hero-shell">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}>
              <div className="hero-kicker">
                <EditionBadge />
                <span className="chip"><Sparkles size={13} /> camera-on practice</span>
              </div>
              <h1 className="hero-headline">The mock interview that <span>reads the room.</span></h1>
              <p className="hero-copy">
                InterPrep turns resume analysis, camera readiness, voice pacing, silence, and answer quality into one practice system. It feels like an interview because it behaves like one.
              </p>
              <div className="hero-actions">
                <StartButton onClick={start}>Begin Interview</StartButton>
                <a className="btn btn-secondary" href="#brief">
                  Explore Edition <ClipboardList size={17} />
                </a>
              </div>
              <div className="hero-meta">
                <div className="metric"><p className="metric-value">12m</p><p className="metric-label">Round</p></div>
                <div className="metric"><p className="metric-value text-success">4</p><p className="metric-label">Signal layers</p></div>
                <div className="metric"><p className="metric-value text-warning">1</p><p className="metric-label">Verdict</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}>
              <HeroStage />
            </motion.div>
          </div>
          <ChapterRail />
        </section>

        <div className="edition-content">
          <section id="brief" className="edition-section">
            <div className="edition-grid">
              <StickyChapterRail />
              <div className="chapter-layout">
                <div className="chapter-copy">
                  <p className="eyebrow">I - Brief</p>
                  <h2 className="serif-title">Resume intelligence before the first question.</h2>
                  <p>InterPrep does not treat the resume as a file upload chore. It turns it into an interviewer brief: strengths to validate, vague claims to probe, and evidence gaps to force into the open.</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <ProofCard icon={FileText} title="Role-specific parsing" copy="The briefing changes by track, so a frontend resume is not judged like an infrastructure resume." />
                    <ProofCard icon={ShieldCheck} title="Claim risk map" copy="Suspicious metrics, vague ownership, and unproven scale claims become interview targets." />
                  </div>
                </div>
                <ResumeMap />
              </div>
            </div>
          </section>

          <section id="baseline" className="edition-section">
            <div className="edition-grid">
              <StickyChapterRail />
              <div className="chapter-layout">
                <div className="proof-stack">
                  <ProofCard icon={Camera} title="Camera baseline" copy="The setup phase captures your normal presence before the interview pressure starts." />
                  <ProofCard icon={Mic} title="Voice reference" copy="Pace and pitch are compared against your own baseline instead of a generic ideal." />
                  <ProofCard icon={Timer} title="Composure window" copy="The awkward seconds before an answer become part of the signal." />
                </div>
                <div className="chapter-copy">
                  <p className="eyebrow">II - Baseline</p>
                  <h2 className="serif-title">A calm reference point before the pressure rises.</h2>
                  <p>Great feedback needs a reference. InterPrep calibrates the camera and microphone first, then measures drift during the live room.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="room" className="edition-section dark">
            <div className="edition-grid">
              <StickyChapterRail />
              <div className="chapter-layout">
                <div className="chapter-copy">
                  <p className="eyebrow">III - Interview</p>
                  <h2 className="serif-title">The room stays quiet until you answer.</h2>
                  <p>The live session is intentionally sparse. One question. One timer. Your camera. Your transcript. No decorative clutter between you and the answer.</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <ProofCard icon={Brain} title="Adaptive question flow" copy="Resume and role details decide what gets asked next." />
                    <ProofCard icon={Radar} title="Delivery signal" copy="WPM, fillers, silence, and confidence drift sit next to answer substance." />
                  </div>
                </div>
                <LiveRoom />
              </div>
            </div>
          </section>

          <section id="report" className="edition-section">
            <div className="edition-grid">
              <StickyChapterRail />
              <div className="chapter-layout">
                <div className="chapter-copy">
                  <p className="eyebrow">IV - Report</p>
                  <h2 className="serif-title">A verdict you can do something with.</h2>
                  <p>The report is not a score slapped onto a transcript. It pairs accuracy with confidence, calls out shallow answers, and turns the next practice session into a focused plan.</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <ProofCard icon={BarChart3} title="Signal graph" copy="See where delivery and substance matched." />
                    <ProofCard icon={CheckCircle2} title="Verdict" copy="Hire, borderline, or no-hire with an honest reason." />
                    <ProofCard icon={History} title="History" copy="Track whether practice is changing the outcome." />
                  </div>
                </div>
                <ReportBoard />
              </div>
            </div>
          </section>

          <RecentSessions onStart={start} />
        </div>
      </main>
    </div>
  )
}

function safeMetrics(metrics: string): Record<string, number | string> {
  try {
    return JSON.parse(metrics)
  } catch {
    return {}
  }
}
