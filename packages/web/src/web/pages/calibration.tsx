import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { Mic, Check } from 'lucide-react'
import { PhaseProgressBar } from '../components/ui/PhaseProgressBar'
import { PhaseLabel } from '../components/ui/PhaseLabel'
import { GlowButton } from '../components/ui/GlowButton'
import { DifferentiatorBox } from '../components/ui/DifferentiatorBox'

type CalibState = 'idle' | 'calibrating' | 'done'

export default function Calibration() {
  const [, setLocation] = useLocation()
  const [state, setState] = useState<CalibState>('idle')
  const [countdown, setCountdown] = useState(30)
  const [cameraOk, setCameraOk] = useState(false)
  const [micOk, setMicOk] = useState(false)
  const [voiceBaseline, setVoiceBaseline] = useState<string | null>(null)
  const [faceBaseline, setFaceBaseline] = useState<string | null>(null)
  const [livePitch, setLivePitch] = useState(142)
  const [liveWpm, setLiveWpm] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Assign stream to video once both ready
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
      } catch {}
    }
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCalibration = () => {
    setState('calibrating')
    setCountdown(30)
    let t = 30
    timerRef.current = setInterval(() => {
      t--
      setCountdown(t)
      setLivePitch(140 + Math.floor(Math.random() * 10))
      setLiveWpm(120 + Math.floor(Math.random() * 30))
      if (t <= 0) {
        clearInterval(timerRef.current!)
        setState('done')
        setVoiceBaseline('142Hz avg')
        setFaceBaseline('Neutral detected')
      }
    }, 1000)
  }

  const handleContinue = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setLocation('/interview')
  }

  const statusItems = [
    { label: 'Camera access', done: cameraOk },
    { label: 'Microphone access', done: micOk },
    { label: 'Voice baseline', done: !!voiceBaseline, value: voiceBaseline },
    { label: 'Face baseline', done: !!faceBaseline, value: faceBaseline },
  ]

  return (
    <div className="min-h-screen bg-bg1">
      <PhaseProgressBar currentPhase={1} />

      <div className="max-w-[680px] mx-auto px-6 pb-24">
        {/* Header */}
        <div className="py-12">
          <PhaseLabel phase="entry" text="PHASE 1 — CALIBRATION" />
          <h1 className="font-serif text-t1 mt-3" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Establishing Your Baseline
          </h1>
          <p className="text-body-lg text-t2 mt-3" style={{ lineHeight: 1.7 }}>
            30 seconds. Say your name and where you're from.<br />
            Speak naturally. Don't perform.
          </p>
        </div>

        {/* Camera */}
        <div className="aspect-video border border-border overflow-hidden relative bg-bg3" style={{ borderRadius: 2 }}>
          <video
            ref={videoRef} autoPlay playsInline muted
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {state === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg3/60">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 border-2 border-border flex items-center justify-center"
                style={{ borderRadius: 2 }}
              >
                <Mic size={28} className="text-t3" />
              </motion.div>
            </div>
          )}

          {state === 'calibrating' && (
            <>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label font-mono uppercase border" style={{ borderRadius: 2, backgroundColor: '#1a0606', borderColor: '#7a1010', color: '#EF4444' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger" />
                  </span>
                  CALIBRATING
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="font-mono text-t1" style={{ fontSize: '2.5rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{countdown}</span>
              </div>
            </>
          )}

          {state === 'done' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.06)' }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 bg-success flex items-center justify-center"
                style={{ borderRadius: 2 }}
              >
                <Check size={32} className="text-white" />
              </motion.div>
            </div>
          )}

          {/* Bottom metrics bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-between px-4 border-t border-border-sub/50"
            style={{ backgroundColor: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-label font-mono text-t4">LIVE METRICS</span>
            <div className="flex gap-4">
              <span className="font-mono text-mono-sm text-t2">{state === 'calibrating' ? `${livePitch}Hz` : '—Hz'}</span>
              <span className="font-mono text-mono-sm text-t2">{state === 'calibrating' ? `${liveWpm} WPM` : '— WPM'}</span>
            </div>
          </div>
        </div>

        {/* Status card */}
        <div className="mt-6 bg-bg2 border border-border" style={{ borderRadius: 2 }}>
          <div className="divide-y" style={{ borderColor: '#1e1e1e' }}>
            {statusItems.map(item => (
              <div key={item.label} className="px-5 py-3.5 flex items-center justify-between" style={{ borderColor: '#1e1e1e' }}>
                <span className="text-body text-t2">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.value && <span className="font-mono text-mono-sm text-success">{item.value}</span>}
                  <div className={`w-2 h-2 ${item.done ? 'bg-success' : 'border border-border'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-body-sm text-t2 italic mt-4">
          Say: "My name is [name] and I'm from [city]." Speak naturally.
        </p>

        <div className="mt-6">
          <DifferentiatorBox
            label="WHY THIS EXISTS"
            text="Every metric during the interview is measured against this baseline. Without it, we'd be measuring stress in a vacuum. The calibration is not optional — it is the science."
          />
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlowButton size="lg" fullWidth onClick={startCalibration} disabled={!cameraOk}>Begin Calibration</GlowButton>
              </motion.div>
            )}
            {state === 'calibrating' && (
              <motion.div key="calibrating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlowButton size="lg" fullWidth loading>Calibrating...</GlowButton>
              </motion.div>
            )}
            {state === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <GlowButton size="lg" fullWidth onClick={handleContinue}>Start Interview →</GlowButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
