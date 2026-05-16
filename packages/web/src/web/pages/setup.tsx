import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Cloud,
  Code2,
  Database,
  FileText,
  Layout,
  Server,
  UploadCloud,
  Video,
  X,
} from 'lucide-react'
import { Brand, StageNav } from '../components/brand'

const ROLES = [
  { id: 'software-engineer', Icon: Code2, name: 'Software Engineer', scope: 'Algorithms, APIs, systems', difficulty: 'Hard' },
  { id: 'frontend-engineer', Icon: Layout, name: 'Frontend Engineer', scope: 'React, UX, performance', difficulty: 'Medium' },
  { id: 'ml-engineer', Icon: Brain, name: 'ML Engineer', scope: 'Models, data, evaluation', difficulty: 'Hard' },
  { id: 'backend-engineer', Icon: Server, name: 'Backend Engineer', scope: 'Databases, scale, services', difficulty: 'Hard' },
  { id: 'data-scientist', Icon: Database, name: 'Data Scientist', scope: 'SQL, metrics, decisions', difficulty: 'Medium' },
  { id: 'devops-sre', Icon: Cloud, name: 'DevOps / SRE', scope: 'Infra, incidents, reliability', difficulty: 'Hard' },
]

type ResumeBrief = {
  name?: string
  strengths?: string[]
  areasToExplore?: string[]
  landmines?: string[]
  summary?: string
}

export default function Setup() {
  const [, setLocation] = useLocation()
  const [selectedRole, setSelectedRole] = useState('software-engineer')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [brief, setBrief] = useState<ResumeBrief | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [cameraOk, setCameraOk] = useState(false)
  const [micOk, setMicOk] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        setCameraOk(true)
        setMicOk(true)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        setCameraError('Allow camera and microphone access to run the interview.')
      }
    }
    startMedia()
    return () => streamRef.current?.getTracks().forEach(track => track.stop())
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setParseError('Upload a PDF resume.')
      return
    }

    setResumeFile(file)
    setBrief(null)
    setParseError(null)
    setParsing(true)

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('role', selectedRole)
      const res = await fetch('/api/sessions/parse-resume', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Parse failed')
      const data = await res.json()
      setBrief(data)
    } catch {
      setParseError('Could not parse the PDF. You can still continue with role-based questions.')
    } finally {
      setParsing(false)
    }
  }, [selectedRole])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const canContinue = Boolean(selectedRole && resumeFile && cameraOk && micOk)

  async function startSession() {
    if (!canContinue) return
    setSubmitting(true)
    try {
      const body = { jobRole: selectedRole, resumeAnalysis: brief }
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      const sessionId = data.session?.id
      if (sessionId) {
        sessionStorage.setItem('sessionId', sessionId)
        sessionStorage.setItem('sessionData', JSON.stringify({ ...body, id: sessionId }))
        sessionStorage.removeItem('reportData')
      }
    } catch {}
    streamRef.current?.getTracks().forEach(track => track.stop())
    setLocation('/calibration')
  }

  const selected = ROLES.find(role => role.id === selectedRole) || ROLES[0]

  return (
    <div className="app-page">
      <header className="app-topbar">
        <div className="app-nav">
          <Brand />
          <StageNav active={0} />
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost" onClick={() => setLocation('/')}>
              <ArrowLeft size={17} /> Dashboard
            </button>
            <button className="btn btn-primary" disabled={!canContinue || submitting} onClick={startSession}>
              {submitting ? 'Creating...' : 'Continue'} <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-container grid gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="grid gap-6">
          <div>
            <p className="eyebrow">Step 1 of 4</p>
            <h1 className="page-title mt-2">Set up the interview room.</h1>
            <p className="body-lg mt-3 max-w-2xl">Choose the role, upload your resume, and confirm camera and microphone access before the mock interview starts.</p>
          </div>

          <div className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow">Role</p>
                <h2 className="text-2xl font-bold text-t1">Pick the interview track</h2>
              </div>
              <span className="chip">{selected.difficulty}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {ROLES.map(role => {
                const isActive = selectedRole === role.id
                return (
                  <button
                    key={role.id}
                    className={`role-card ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <role.Icon size={26} className={isActive ? 'text-success' : 'text-t3'} />
                    <strong className="mt-4 block text-lg">{role.name}</strong>
                    <span className="body mt-1 block">{role.scope}</span>
                    {isActive && <Check size={18} className="absolute right-16 top-18 text-success" />}
                    <span className="chip absolute right-4 top-4">{role.difficulty}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow">Resume</p>
                <h2 className="text-2xl font-bold text-t1">Upload a PDF resume</h2>
              </div>
              {resumeFile && <span className="chip text-success"><Check size={13} /> attached</span>}
            </div>

            {!resumeFile ? (
              <div
                className={`dropzone ${dragOver ? 'active' : ''}`}
                onDragOver={event => { event.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div>
                  <UploadCloud size={42} className="mx-auto text-t3" />
                  <p className="mt-4 text-xl font-bold text-t1">Drop your resume here</p>
                  <p className="body mt-1">PDF only. It is used to generate sharper questions.</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={event => {
                    const file = event.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>
            ) : (
              <div className="panel-soft p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="flex-shrink-0 text-success" size={22} />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-t1">{resumeFile.name}</p>
                      <p className="body">{parsing ? 'Parsing resume...' : brief ? 'Resume brief ready' : 'Resume attached'}</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost" onClick={() => { setResumeFile(null); setBrief(null); setParseError(null) }}>
                    <X size={17} />
                  </button>
                </div>
                {parsing && <div className="bar mt-4"><span style={{ width: '72%' }} /></div>}
                {parseError && <p className="body mt-4 text-warning">{parseError}</p>}
              </div>
            )}
          </div>
        </section>

        <aside className="grid content-start gap-6 lg:sticky lg:top-24">
          <div className="panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Camera and microphone</p>
                <h2 className="text-2xl font-bold text-t1">Readiness check</h2>
              </div>
              <Video className={cameraOk ? 'text-success' : 'text-t3'} />
            </div>
            <div className="camera-box">
              <video ref={videoRef} autoPlay playsInline muted />
              {!cameraOk && (
                <div className="absolute inset-0 grid place-items-center text-center">
                  <p className="body">{cameraError || 'Starting camera...'}</p>
                </div>
              )}
              <div className="absolute left-4 top-4 chip">
                <span className={`status-dot ${cameraOk ? 'ok' : 'warn'}`} />
                {cameraOk ? 'camera on' : 'waiting'}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ['Role', Boolean(selectedRole)],
                ['Resume', Boolean(resumeFile)],
                ['Media', cameraOk && micOk],
              ].map(([label, ok]) => (
                <div key={label as string} className="metric">
                  <span className={`status-dot ${ok ? 'ok' : ''}`} />
                  <p className="metric-label">{label as string}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <p className="eyebrow">Interviewer brief</p>
            <h2 className="mt-2 text-2xl font-bold text-t1">{brief?.name ? `${brief.name}'s brief` : 'Generated after upload'}</h2>
            <p className="body mt-2">{brief?.summary || 'The AI will use your resume to choose sharper follow-up questions and identify claims worth testing.'}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="eyebrow text-success">Strengths</p>
                {(brief?.strengths || ['Role fit', 'Technical depth', 'Project history']).slice(0, 3).map(item => (
                  <p key={item} className="body mt-2">- {item}</p>
                ))}
              </div>
              <div>
                <p className="eyebrow text-warning">Will probe</p>
                {(brief?.areasToExplore || brief?.landmines || ['Scale claims', 'Ownership examples', 'Tradeoffs']).slice(0, 3).map(item => (
                  <p key={item} className="body mt-2">- {item}</p>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
