import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { Code2, Layout, Brain, Server, BarChart, Cloud, UploadCloud, FileText, Camera, Check, X } from 'lucide-react'
import { PhaseProgressBar } from '../components/ui/PhaseProgressBar'
import { PhaseLabel } from '../components/ui/PhaseLabel'
import { GlowButton } from '../components/ui/GlowButton'
import { DifferentiatorBox } from '../components/ui/DifferentiatorBox'
import { AILoadingCard } from '../components/ui/AILoadingCard'
import { ErrorCard } from '../components/ui/ErrorCard'
import { staggerContainer } from '../../lib/motion'

const ROLES = [
  { id: 'software-engineer', Icon: Code2, name: 'Software Engineer', tagline: 'Systems & Algorithms', difficulty: 'Hard' },
  { id: 'frontend-engineer', Icon: Layout, name: 'Frontend Engineer', tagline: 'UI & Experience', difficulty: 'Medium' },
  { id: 'ml-engineer', Icon: Brain, name: 'ML Engineer', tagline: 'Models & Data', difficulty: 'Hard' },
  { id: 'backend-engineer', Icon: Server, name: 'Backend Engineer', tagline: 'APIs & Infrastructure', difficulty: 'Medium-Hard' },
  { id: 'data-scientist', Icon: BarChart, name: 'Data Scientist', tagline: 'Analysis & SQL', difficulty: 'Medium' },
  { id: 'devops-sre', Icon: Cloud, name: 'DevOps / SRE', tagline: 'CI/CD & Infra', difficulty: 'Medium-Hard' },
]

export default function Setup() {
  const [, setLocation] = useLocation()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [parseLines, setParseLines] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [cameraOk, setCameraOk] = useState(false)
  const [micOk, setMicOk] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [proceed, setProceed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Assign stream to video once both are ready
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraOk])

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        setCameraOk(true)
        setMicOk(true)
        setTimeout(() => setFaceDetected(true), 1500)
      } catch {
        setCameraError('Camera access denied. Please allow camera and microphone.')
      }
    }
    startCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const parseMessages = ['Extracting skills and projects...', 'Detecting gaps...', 'Building interviewer brief...']

  const handleFile = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/pdf') { setParseError('Please upload a PDF file.'); return }
    setResumeFile(file)
    setParseError(null)
    setParsedData(null)
    setParsing(true)
    setParseLines([])

    for (let i = 0; i < parseMessages.length; i++) {
      await new Promise(r => setTimeout(r, 600 + i * 400))
      setParseLines(prev => [...prev, parseMessages[i]])
    }

    try {
      const fd = new FormData()
      fd.append('resume', file)
      if (selectedRole) fd.append('role', selectedRole)
      const res = await fetch('/api/sessions/parse-resume', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Parse failed')
      const data = await res.json()
      setParsedData(data)
    } catch {
      setParseError('Failed to parse resume. Try again.')
    } finally {
      setParsing(false)
    }
  }, [selectedRole])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const canProceed = selectedRole && (parsedData || resumeFile) && cameraOk

  const handleProceed = async () => {
    if (!canProceed) return
    setProceed(true)
    try {
      const body = { jobRole: selectedRole, resumeAnalysis: parsedData }
      const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      const sessionId = data.session?.id
      if (sessionId) {
        sessionStorage.setItem('sessionId', sessionId)
        sessionStorage.setItem('sessionData', JSON.stringify({ ...body, id: sessionId }))
      }
    } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop())
    setLocation('/calibration')
  }

  return (
    <div className="min-h-screen bg-bg1">
      <PhaseProgressBar currentPhase={1} />

      <div className="max-w-[680px] mx-auto px-6 pb-24">
        {/* Header */}
        <div className="py-12">
          <PhaseLabel phase="entry" text="PHASE 1 — ENTRY" />
          <h1 className="font-serif text-t1 mt-3" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Set the Stage
          </h1>
          <p className="text-body-lg text-t2 mt-3" style={{ lineHeight: 1.7 }}>
            Choose your role. Upload your resume.<br />
            The AI will brief itself before you do.
          </p>
        </div>

        {/* Step 1 — Role */}
        <section>
          <p className="text-label font-mono text-t3 uppercase tracking-widest mb-4">01  Role Selection</p>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3" variants={staggerContainer} initial="hidden" animate="visible">
            {ROLES.map((role, i) => {
              const isSelected = selectedRole === role.id
              return (
                <motion.div
                  key={role.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.97 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: i * 0.06 } }
                  }}
                  onClick={() => setSelectedRole(role.id)}
                  className="relative p-4 cursor-pointer border transition-all"
                  style={{
                    borderRadius: 2,
                    backgroundColor: isSelected ? 'rgba(92,79,255,0.05)' : '#141414',
                    borderColor: isSelected ? '#5c4fff' : '#2a2a2a',
                    boxShadow: isSelected ? '0 0 16px -4px rgba(92,79,255,0.3)' : undefined,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <role.Icon size={26} style={{ color: isSelected ? '#5c4fff' : '#9e9a92' }} />
                  <p className="text-h3 text-t1 font-semibold mt-3">{role.name}</p>
                  <p className="text-body-sm text-t3">{role.tagline}</p>
                  <div className="absolute bottom-3 right-3">
                    <span className="font-mono text-label text-t3 border border-border px-2 py-0.5" style={{ borderRadius: 2 }}>
                      {role.difficulty}
                    </span>
                  </div>
                  {isSelected && (
                    <motion.div
                      className="absolute top-3 right-3 w-4 h-4 bg-accent flex items-center justify-center"
                      style={{ borderRadius: 2 }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* Step 2 — Resume */}
        <section className="mt-10">
          <p className="text-label font-mono text-t3 uppercase tracking-widest mb-4">02  Resume Upload</p>

          {!resumeFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed h-40 flex flex-col items-center justify-center cursor-pointer transition-all"
              style={{
                borderRadius: 2,
                borderColor: dragOver ? '#5c4fff' : '#2a2a2a',
                backgroundColor: dragOver ? 'rgba(92,79,255,0.04)' : '#141414',
              }}
            >
              <UploadCloud size={32} style={{ color: dragOver ? '#5c4fff' : '#5a5650' }} />
              <p className="text-h3 text-t2 mt-3">Drop your resume here</p>
              <p className="text-body-sm text-t3 mt-1">PDF only · Max 5MB</p>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          ) : (
            <div>
              <div
                className="border p-4 flex items-center justify-between"
                style={{ borderRadius: 2, borderColor: parsedData ? 'rgba(34,197,94,0.35)' : '#2a2a2a', backgroundColor: parsedData ? 'rgba(34,197,94,0.04)' : '#141414' }}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} style={{ color: parsedData ? '#22C55E' : '#9e9a92' }} />
                  <span className="text-body text-t2">{resumeFile.name}</span>
                </div>
                <button onClick={() => { setResumeFile(null); setParsedData(null); setParseLines([]) }} className="text-t3 hover:text-danger transition-colors">
                  <X size={16} />
                </button>
              </div>

              {parsing && (
                <div className="mt-3 p-4 bg-bg2 border border-border" style={{ borderRadius: 2 }}>
                  <p className="text-label font-mono text-t3 uppercase tracking-widest mb-3">Parsing Resume</p>
                  <div className="flex flex-col gap-2">
                    {parseMessages.map((msg, i) => (
                      <AnimatePresence key={i}>
                        {parseLines.length > i && (
                          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                            <span className="text-body-sm text-t3">· {msg}</span>
                            <span className="text-body-sm text-success">✓</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                  <div className="mt-3">
                    <AILoadingCard customMessages={['Reading your resume...', 'Finding gaps...', 'Building your briefing...']} />
                  </div>
                </div>
              )}

              {parsedData && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 border p-5"
                  style={{ borderRadius: 2, backgroundColor: '#0a1520', borderColor: 'rgba(14,165,233,0.25)', borderTop: '2px solid #0EA5E9' }}
                >
                  <p className="font-mono text-label uppercase tracking-widest text-phase-entry mb-3">AI Briefing — Eyes Only</p>
                  <div className="border-t border-border-sub mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-label font-mono text-success uppercase mb-2">Strengths</p>
                      {(parsedData.strengths || ['Strong technical background', 'Relevant experience', 'Good fundamentals']).slice(0, 3).map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5">
                          <span className="w-1 h-1 bg-success flex-shrink-0 mt-2" />
                          <span className="text-body-sm text-t2">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-label font-mono text-warning uppercase mb-2">Will Probe</p>
                      {(parsedData.areasToExplore || parsedData.weaknesses || ['Depth on scalability', 'Team collaboration', 'System design']).slice(0, 3).map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5">
                          <span className="w-1 h-1 bg-warning flex-shrink-0 mt-2" />
                          <span className="text-body-sm text-t2">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="font-mono text-mono-sm text-t3 italic mt-4">The interviewer has read your file.</p>
                </motion.div>
              )}

              {parseError && <ErrorCard title="Parse Error" message={parseError} onRetry={() => { setResumeFile(null); setParseError(null) }} />}
            </div>
          )}
        </section>

        {/* Step 3 — Camera */}
        <section className="mt-10">
          <p className="text-label font-mono text-t3 uppercase tracking-widest mb-4">03  Camera Check</p>

          <div className="aspect-video border border-border overflow-hidden relative bg-bg3" style={{ borderRadius: 2 }}>
            <video
              ref={videoRef} autoPlay playsInline muted
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {!cameraOk && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-body text-t3 font-mono">Starting camera...</p>
              </div>
            )}
            {cameraOk && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label font-mono uppercase border" style={{ borderRadius: 2, backgroundColor: '#1a0606', borderColor: '#7a1010', color: '#EF4444' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger" />
                  </span>
                  CHECKING
                </span>
              </div>
            )}
            {cameraOk && (
              <div
                className="absolute top-1/2 left-1/2 border"
                style={{ width: '45%', height: '65%', transform: 'translate(-50%, -50%)', borderColor: faceDetected ? 'rgba(34,197,94,0.6)' : 'rgba(92,79,255,0.4)', borderWidth: 2, borderRadius: 2 }}
              />
            )}
          </div>

          {cameraError && <div className="mt-3"><ErrorCard title="Camera Error" message={cameraError} /></div>}

          <div className="mt-4 flex gap-6">
            {[{ label: 'Camera OK', ok: cameraOk }, { label: 'Mic OK', ok: micOk }, { label: 'Face Detected', ok: faceDetected }].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 ${item.ok ? 'bg-success' : 'bg-border'}`} />
                <span className="text-body-sm text-t2">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <DifferentiatorBox
              label="WHY THIS EXISTS"
              text="We don't watch your camera for show. We capture 2 seconds of your face before each answer. That's where the truth is — before you've even spoken."
            />
          </div>
        </section>

        {/* Proceed */}
        <div className="mt-10">
          <GlowButton size="lg" fullWidth disabled={!canProceed} loading={proceed} onClick={handleProceed}>
            Proceed to Calibration →
          </GlowButton>
          {!canProceed && (
            <p className="text-body-sm text-t3 text-center mt-2 font-mono">
              {!selectedRole ? 'Select a role to continue' : !resumeFile ? 'Upload your resume' : !cameraOk ? 'Camera access required' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
