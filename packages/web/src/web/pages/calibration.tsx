import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import { ArrowLeft, ArrowRight, CheckCircle2, Mic, Video } from 'lucide-react'
import { Brand, StageNav } from '../components/brand'

type CalibState = 'ready' | 'running' | 'complete'

export default function Calibration() {
  const [, setLocation] = useLocation()
  const [state, setState] = useState<CalibState>('ready')
  const [seconds, setSeconds] = useState(20)
  const [cameraOk, setCameraOk] = useState(false)
  const [micOk, setMicOk] = useState(false)
  const [pitch, setPitch] = useState(142)
  const [pace, setPace] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        setCameraOk(true)
        setMicOk(true)
        const assignStream = async () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play().catch(() => {})
          } else {
            setTimeout(assignStream, 100)
          }
        }
        assignStream()
      } catch {}
    }
    startMedia()
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function startCalibration() {
    setState('running')
    setSeconds(20)
    let remaining = 20
    timerRef.current = setInterval(() => {
      remaining -= 1
      setSeconds(remaining)
      setPitch(134 + Math.floor(Math.random() * 22))
      setPace(112 + Math.floor(Math.random() * 36))
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        setState('complete')
        setPitch(142)
        setPace(126)
      }
    }, 1000)
  }

  function continueToInterview() {
    streamRef.current?.getTracks().forEach(track => track.stop())
    setLocation('/interview')
  }

  const progress = state === 'running' ? ((20 - seconds) / 20) * 100 : state === 'complete' ? 100 : 0

  return (
    <div className="app-page">
      <header className="app-topbar">
        <div className="app-nav">
          <Brand />
          <StageNav active={1} />
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost" onClick={() => setLocation('/setup')}>
              <ArrowLeft size={17} /> Setup
            </button>
            <button className="btn btn-primary" disabled={state !== 'complete'} onClick={continueToInterview}>
              Start Interview <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-container grid min-h-[calc(100vh-72px)] items-center gap-6 py-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel overflow-hidden">
          <div className="camera-box aspect-[16/9] border-0">
            <video ref={videoRef} autoPlay playsInline muted />
            {!cameraOk && (
              <div className="absolute inset-0 grid place-items-center text-center">
                <p className="body">Camera is starting...</p>
              </div>
            )}
            <div className="absolute left-5 top-5 flex gap-2">
              <span className="chip"><span className={`status-dot ${cameraOk ? 'ok' : 'warn'}`} /> camera</span>
              <span className="chip"><span className={`status-dot ${micOk ? 'ok' : 'warn'}`} /> mic</span>
            </div>
            {state === 'running' && (
              <div className="absolute right-5 top-5 rounded-[8px] bg-bg0/80 px-5 py-3 text-right backdrop-blur">
                <p className="font-mono text-4xl text-t1">{seconds}</p>
                <p className="metric-label">seconds</p>
              </div>
            )}
            {state === 'complete' && (
              <div className="absolute inset-0 grid place-items-center bg-bg0/50 backdrop-blur-sm">
                <div className="panel p-6 text-center">
                  <CheckCircle2 size={44} className="mx-auto text-success" />
                  <p className="mt-3 text-2xl font-bold text-t1">Baseline saved</p>
                  <p className="body mt-1">The interview will compare live signals against this reference.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="grid gap-6">
          <div>
            <p className="eyebrow">Step 2 of 4</p>
            <h1 className="page-title mt-2">Build your baseline.</h1>
            <p className="body-lg mt-3">Read the prompt naturally for 20 seconds. This gives the report a reference point for voice and composure.</p>
          </div>

          <div className="panel p-5">
            <p className="eyebrow">Prompt</p>
            <p className="mt-3 text-2xl font-bold leading-snug text-t1">
              “My name is [name]. I’m interviewing for this role because I want to build reliable products with a strong team.”
            </p>
            <div className="bar mt-5"><span style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="metric">
              <Mic className="mb-3 text-success" size={20} />
              <p className="metric-value">{pitch}Hz</p>
              <p className="metric-label">Voice baseline</p>
            </div>
            <div className="metric">
              <Video className="mb-3 text-accent" size={20} />
              <p className="metric-value">{pace || '-'} WPM</p>
              <p className="metric-label">Natural pace</p>
            </div>
          </div>

          {state === 'ready' && (
            <button className="btn btn-primary" disabled={!cameraOk || !micOk} onClick={startCalibration}>
              Begin Calibration <ArrowRight size={17} />
            </button>
          )}
          {state === 'running' && <button className="btn btn-secondary" disabled>Recording baseline...</button>}
          {state === 'complete' && (
            <button className="btn btn-primary" onClick={continueToInterview}>
              Enter Interview <ArrowRight size={17} />
            </button>
          )}
        </aside>
      </main>
    </div>
  )
}
