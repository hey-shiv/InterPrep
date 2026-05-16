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
  const [liveEmotion, setLiveEmotion] = useState('NEUTRAL')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
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

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setState('done')
          setVoiceBaseline('142Hz avg')
          setFaceBaseline('Neutral detected')
          return 0
        }
        // Simulate live metrics
        setLivePitch(140 + Math.floor(Math.random() * 10))
        setLiveWpm(120 + Math.floor(Math.random() * 30))
        return prev - 1
      })
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
        <div className="py-10">
          <PhaseLabel phase="entry" text="PHASE 1 — CALIBRATION" />
          <h1 className="text-display-md text-t1 font-bold mt-2">Establishing Your Baseline</h1>
          <p className="text-body-lg text-t2 mt-3">
            30 seconds. Say your name and where you're from.<br />
            Speak naturally. Don't perform.
          </p>
        </div>

        {/* Camera */}
        <div className="aspect-video rounded-card-lg border border-border overflow-hidden relative bg-bg3">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

          {/* Idle center overlay */}
          {state === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full border-2 border-border flex items-center justify-center"
              >
                <Mic size={28} className="text-t3" />
              </motion.div>
            </div>
          )}

          {/* Running state */}
          {state === 'calibrating' && (
            <>
              {/* TL badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 rounded-chip px-3 py-1 text-label font-mono uppercase border bg-[#1A0606] text-danger border-[#7A1010]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger" />
                  </span>
                  CALIBRATING
                </span>
              </div>
              {/* Countdown */}
              <div className="absolute top-4 right-4">
                <span className="font-mono text-3xl text-white">{countdown}</span>
              </div>
            </>
          )}

          {/* Done overlay */}
          {state === 'done' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.08)' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-success flex items-center justify-center"
              >
                <Check size={32} className="text-white" />
              </motion.div>
            </div>
          )}

          {/* Bottom live metrics */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-between px-4 border-t border-border-sub/50"
            style={{ backgroundColor: 'rgba(7,7,12,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-label font-mono text-t4">LIVE METRICS</span>
            <div className="flex gap-3">
              {[
                `${livePitch}Hz`,
                state === 'calibrating' ? `${liveWpm} WPM` : '— WPM',
                liveEmotion,
              ].map(m => (
                <span key={m} className="font-mono text-mono-sm text-t2">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Status card */}
        <div className="mt-6 bg-bg2 border border-border rounded-card p-5">
          <div className="divide-y divide-border-sub">
            {statusItems.map(item => (
              <div key={item.label} className="py-3 flex items-center justify-between">
                <span className="text-body text-t2">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="font-mono text-mono-sm text-success">{item.value}</span>
                  )}
                  <motion.div
                    className={`w-2 h-2 rounded-full ${item.done ? 'bg-success' : 'border border-border'}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={item.done ? { type: 'spring', stiffness: 300, damping: 20 } : {}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instruction */}
        <p className="text-center text-body-sm text-t2 italic mt-4">
          Say: "My name is [name] and I'm from [city]." Speak naturally.
        </p>

        {/* Differentiator */}
        <div className="mt-6">
          <DifferentiatorBox
            label="WHY THIS EXISTS"
            text="Every metric during the interview is measured against this baseline. Without it, we'd be measuring stress in a vacuum. The calibration is not optional — it is the science."
          />
        </div>

        {/* CTA */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlowButton size="lg" fullWidth onClick={startCalibration} disabled={!cameraOk}>
                  Begin Calibration
                </GlowButton>
              </motion.div>
            )}
            {state === 'calibrating' && (
              <motion.div key="calibrating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlowButton size="lg" fullWidth loading>
                  Calibrating...
                </GlowButton>
              </motion.div>
            )}
            {state === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GlowButton size="lg" fullWidth onClick={handleContinue}>
                  Start Interview →
                </GlowButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
