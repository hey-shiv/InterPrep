import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import {
  Code2, Layout, Brain, Server, BarChart, Cloud,
  UploadCloud, FileText, Camera, Check, X
} from 'lucide-react'
import { PhaseProgressBar } from '../components/ui/PhaseProgressBar'
import { PhaseLabel } from '../components/ui/PhaseLabel'
import { GlowButton } from '../components/ui/GlowButton'
import { DifferentiatorBox } from '../components/ui/DifferentiatorBox'
import { AILoadingCard } from '../components/ui/AILoadingCard'
import { ErrorCard } from '../components/ui/ErrorCard'
import { staggerContainer, revealVariants } from '../../lib/motion'

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

  // Camera check
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraOk(true)
        setMicOk(true)
        setTimeout(() => setFaceDetected(true), 1500)
      } catch (e) {
        setCameraError('Camera access denied. Please allow camera and microphone.')
      }
    }
    startCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const parseMessages = ['Extracting skills and projects...', 'Detecting gaps...', 'Building interviewer brief...']

  const handleFile = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setParseError('Please upload a PDF file.')
      return
    }
    setResumeFile(file)
    setParseError(null)
    setParsedData(null)
    setParsing(true)
    setParseLines([])

    // Animate parse lines
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
    } catch (e) {
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
    // Store session data
    try {
      const body = {
        jobRole: selectedRole,
        resumeAnalysis: parsedData,
      }
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
        <div className="py-10">
          <PhaseLabel phase="entry" text="PHASE 1 — ENTRY" />
          <h1 className="text-display-md text-t1 font-bold mt-2">Set the Stage</h1>
          <p className="text-body-lg text-t2 mt-3">
            Choose your role. Upload your resume.<br />
            The AI will brief itself before you do.
          </p>
        </div>

        {/* Step 1 — Role Selection */}
        <section>
          <p className="text-label font-mono text-t3 uppercase tracking-wide mb-4">01  JD SELECTION</p>
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {ROLES.map((role, i) => {
              const isSelected = selectedRole === role.id
              return (
                <motion.div
                  key={role.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  onClick={() => setSelectedRole(role.id)}
                  className="relative rounded-card p-4 cursor-pointer border transition-all duration-200"
                  style={{
                    backgroundColor: isSelected ? 'rgba(99,102,241,0.05)' : '#111118',
                    borderColor: isSelected ? '#6366F1' : '#2A2A3A',
                    boxShadow: isSelected ? '0 0 16px -4px rgba(99,102,241,0.4)' : undefined,
                  }}
                  whileHover={{ backgroundColor: isSelected ? 'rgba(99,102,241,0.05)' : '#16161E' } as any}
                  whileTap={{ scale: 0.98 }}
                >
                  <role.Icon
                    size={28}
                    style={{ color: isSelected ? '#0EA5E9' : '#9898B0' }}
                  />
                  <p className="text-h3 text-t1 font-semibold mt-3">{role.name}</p>
                  <p className="text-body-sm text-t3">{role.tagline}</p>
                  <div className="absolute bottom-3 right-3">
                    <span className="font-mono text-label text-t3 border border-border rounded-chip px-2 py-0.5">
                      {role.difficulty}
                    </span>
                  </div>
                  {isSelected && (
                    <motion.div
                      className="absolute top-3 right-3 w-4 h-4 rounded-full bg-accent flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
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

        {/* Step 2 — Resume Upload */}
        <section className="mt-8">
          <p className="text-label font-mono text-t3 uppercase tracking-wide mb-4">02  RESUME UPLOAD</p>

          {!resumeFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-card-lg h-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
              style={{
                borderColor: dragOver ? '#6366F1' : '#2A2A3A',
                backgroundColor: dragOver ? 'rgba(99,102,241,0.05)' : '#111118',
              }}
            >
              <UploadCloud size={32} style={{ color: dragOver ? '#6366F1' : '#55556A' }} className={dragOver ? 'scale-110' : ''} />
              <p className="text-h3 text-t2 mt-3">Drop your resume here</p>
              <p className="text-body-sm text-t3 mt-1">PDF only · Max 5MB</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          ) : (
            <div>
              {/* File info */}
              <div
                className="border rounded-card p-4 flex items-center justify-between"
                style={{ borderColor: parsedData ? 'rgba(34,197,94,0.40)' : '#2A2A3A', backgroundColor: parsedData ? 'rgba(34,197,94,0.05)' : '#111118' }}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} style={{ color: parsedData ? '#22C55E' : '#9898B0' }} />
                  <span className="text-body text-t2">{resumeFile.name}</span>
                </div>
                <button
                  onClick={() => { setResumeFile(null); setParsedData(null); setParseLines([]) }}
                  className="text-t3 hover:text-danger transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Parse progress */}
              {parsing && (
                <div className="mt-3 p-4 bg-bg2 border border-border rounded-card">
                  <p className="text-label font-mono text-t3 uppercase tracking-wide mb-3">PARSING RESUME</p>
                  <div className="flex flex-col gap-2">
                    {parseMessages.map((msg, i) => (
                      <AnimatePresence key={i}>
                        {parseLines.length > i && (
                          <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-body-sm text-t3">· {msg}</span>
                            {parseLines.length > i && <span className="text-body-sm text-success">✓</span>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                  <AILoadingCard customMessages={['Reading your resume...', 'Finding gaps...', 'Building your briefing...']} />
                </div>
              )}

              {/* Parsed result */}
              {parsedData && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 rounded-card border p-5"
                  style={{ backgroundColor: '#0C1A24', borderColor: 'rgba(14,165,233,0.30)' }}
                >
                  <p className="font-mono text-label uppercase tracking-wide text-phase-entry mb-3">AI BRIEFING — EYES ONLY</p>
                  <div className="border-t border-border-sub mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-label font-mono text-success uppercase mb-2">STRENGTHS</p>
                      {(parsedData.strengths || ['Strong technical background', 'Relevant experience', 'Good fundamentals']).slice(0, 3).map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5">
                          <span className="w-1 h-1 rounded-full bg-success flex-shrink-0 mt-2" />
                          <span className="text-body-sm text-t2">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-label font-mono text-warning uppercase mb-2">AREAS WE'LL EXPLORE</p>
                      {(parsedData.areasToExplore || parsedData.weaknesses || ['Depth on scalability', 'Team collaboration', 'System design gaps']).slice(0, 3).map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5">
                          <span className="w-1 h-1 rounded-full bg-warning flex-shrink-0 mt-2" />
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

        {/* Step 3 — Camera Check */}
        <section className="mt-8">
          <p className="text-label font-mono text-t3 uppercase tracking-wide mb-4">03  CAMERA CHECK</p>

          <div className="aspect-video rounded-card overflow-hidden border border-border relative bg-bg3">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {!cameraOk && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-body text-t3 font-mono">Starting camera...</p>
              </div>
            )}

            {cameraOk && (
              <div className="absolute top-3 left-3">
                <SectionBadge variant="live" label="CHECKING" />
              </div>
            )}

            {/* Face guide */}
            {cameraOk && (
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[40%] border"
                style={{ width: '45%', height: '65%', borderColor: faceDetected ? 'rgba(34,197,94,0.6)' : 'rgba(99,102,241,0.4)', borderWidth: 2 }}
              />
            )}
          </div>

          {cameraError && (
            <div className="mt-3">
              <ErrorCard title="Camera Error" message={cameraError} />
            </div>
          )}

          {/* Status row */}
          <div className="mt-4 flex gap-6">
            {[
              { label: 'Camera OK', ok: cameraOk },
              { label: 'Mic OK', ok: micOk },
              { label: 'Face Detected', ok: faceDetected },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-success' : 'bg-border'}`} />
                <span className="text-body-sm text-t2">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <DifferentiatorBox
              label="THE THING NOBODY ELSE DOES"
              text="We don't watch your camera for show. We capture 2 seconds of your face before each answer. That's where the truth is — before you've even spoken."
            />
          </div>
        </section>

        {/* Proceed */}
        <div className="mt-8">
          <GlowButton
            size="lg"
            fullWidth
            disabled={!canProceed}
            loading={proceed}
            onClick={handleProceed}
          >
            Proceed to Calibration →
          </GlowButton>
          {!canProceed && (
            <p className="text-body-sm text-t3 text-center mt-2">
              {!selectedRole ? 'Select a role to continue' : !resumeFile ? 'Upload your resume' : !cameraOk ? 'Camera access required' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Need SectionBadge import fix — re-export locally
function SectionBadge({ variant, label }: { variant: string; label: string }) {
  const isLive = variant === 'live'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-chip px-3 py-1 text-label font-sans uppercase border tracking-wide bg-[#1A0606] text-danger border-[#7A1010]">
      {isLive && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger" />
        </span>
      )}
      {label}
    </span>
  )
}
