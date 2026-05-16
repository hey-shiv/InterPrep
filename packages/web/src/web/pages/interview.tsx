import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useSpring } from 'framer-motion'
import { useLocation } from 'wouter'
import { Mic, MicOff, AlertTriangle } from 'lucide-react'
import { GlowButton } from '../components/ui/GlowButton'
import { WaveformVisualizer } from '../components/ui/WaveformVisualizer'
import { EmotionOrb } from '../components/ui/EmotionOrb'
import { LiveMetricBadge } from '../components/ui/LiveMetricBadge'
import { SectionBadge } from '../components/ui/SectionBadge'
import { wordReveal } from '../../lib/motion'

type Emotion = 'neutral' | 'confident' | 'nervous' | 'engaged' | 'confused'
type InterviewState = 'loading' | 'question' | 'silence' | 'listening' | 'processing' | 'done'

interface Question {
  id: string
  text: string
  type: string
  difficulty?: string
}

const TOTAL_TIME = 10 * 60 // 10 minutes

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export default function Interview() {
  const [, setLocation] = useLocation()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [state, setState] = useState<InterviewState>('loading')
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [silenceCountdown, setSilenceCountdown] = useState(4)
  const [emotion, setEmotion] = useState<Emotion>('neutral')
  const [wpm, setWpm] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [fillers, setFillers] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [wordTimings, setWordTimings] = useState<number[]>([])
  const [displayedWords, setDisplayedWords] = useState(0)
  const [sttAvailable, setSttAvailable] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<any>(null)
  const questionWordsRef = useRef<string[]>([])

  // Load questions on mount
  useEffect(() => {
    const sid = sessionStorage.getItem('sessionId')
    const sdata = sessionStorage.getItem('sessionData')
    if (!sid) { setLocation('/setup'); return }
    setSessionId(sid)

    async function loadQuestions() {
      try {
        const parsed = sdata ? JSON.parse(sdata) : {}
        const res = await fetch('/api/ai/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: parsed.jobRole, resumeData: parsed.resumeAnalysis, sessionId: sid }),
        })
        const data = await res.json()
        setQuestions(data.questions || getDefaultQuestions())
        setState('question')
        startTimer()
      } catch {
        setQuestions(getDefaultQuestions())
        setState('question')
        startTimer()
      }
    }
    loadQuestions()

    // Camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => {})

    // STT check
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSttAvailable(false)
    }

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current)
      recognitionRef.current?.stop()
    }
  }, [])

  // Simulate live metrics
  useEffect(() => {
    if (state !== 'listening') return
    const interval = setInterval(() => {
      setWpm(120 + Math.floor(Math.random() * 40))
      setPitch(130 + Math.floor(Math.random() * 30))
      setEmotion(['neutral', 'confident', 'engaged', 'nervous'][Math.floor(Math.random() * 4)] as Emotion)
    }, 2000)
    return () => clearInterval(interval)
  }, [state])

  // Reveal question words
  useEffect(() => {
    if (state !== 'question' || questions.length === 0) return
    const q = questions[currentQ]
    if (!q) return
    const words = q.text.split(' ')
    questionWordsRef.current = words
    setDisplayedWords(0)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedWords(i)
      if (i >= words.length) {
        clearInterval(interval)
        // Start silence countdown after words revealed
        setTimeout(() => startSilenceWindow(), 300)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [currentQ, state, questions.length])

  function startTimer() {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          endInterview()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function startSilenceWindow() {
    setState('silence')
    setSilenceCountdown(4)
    let t = 4
    silenceTimerRef.current = setInterval(() => {
      t--
      setSilenceCountdown(t)
      if (t <= 0) {
        clearInterval(silenceTimerRef.current!)
        startListening()
      }
    }, 1000)
  }

  function startListening() {
    setState('listening')
    setCurrentAnswer('')
    setFillers(0)

    if (!sttAvailable) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'literally']
    recognition.onresult = (e: any) => {
      let full = ''
      let fillerCount = 0
      for (let i = 0; i < e.results.length; i++) {
        const text = e.results[i][0].transcript
        full += text + ' '
        fillerWords.forEach(f => { if (text.toLowerCase().includes(f)) fillerCount++ })
      }
      setCurrentAnswer(full.trim())
      setFillers(fillerCount)
      const wordCount = full.trim().split(/\s+/).length
      setWpm(Math.round(wordCount * 6))
    }
    recognition.start()
  }

  const stopAnswering = useCallback(() => {
    recognitionRef.current?.stop()
    setState('processing')

    const q = questions[currentQ]
    if (q) {
      setAnswers(prev => ({ ...prev, [q.id]: currentAnswer }))
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1)
        setState('question')
        setCurrentAnswer('')
      } else {
        endInterview()
      }
    }, 500)
  }, [currentQ, questions, currentAnswer])

  async function endInterview() {
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    setState('done')

    if (!sessionId) { setLocation('/report'); return }

    try {
      const payload = { answers, questions, sessionId }
      await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {}

    setLocation('/report')
  }

  const q = questions[currentQ]
  const qWords = q?.text.split(' ') || []
  const progress = questions.length > 0 ? ((currentQ) / questions.length) : 0

  const timerColor = timeLeft < 60 ? 'text-danger' : timeLeft < 180 ? 'text-warning' : 'text-t1'

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-bg0 flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-1.5 justify-center mb-4">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-accent"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
            ))}
          </div>
          <p className="text-body text-t3 font-mono">Preparing your interview...</p>
        </div>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="min-h-screen bg-bg0 flex items-center justify-center">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-6">
            <span className="text-display-md font-bold text-success">✓</span>
          </motion.div>
          <p className="text-h1 text-t1 font-bold mb-2">Interview Complete</p>
          <p className="text-body text-t3">Generating your report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-bg0 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 bg-bg0 border-b border-border-sub flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-mono text-mono-sm text-t3">Q{currentQ + 1} / {questions.length || 8}</span>
          <div className="w-24 h-1 bg-border rounded-chip overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-chip"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger" />
          </span>
          <span className="text-label font-mono text-danger">PHASE 2 · LIVE</span>
        </div>

        <div className="flex items-center gap-6">
          <motion.span
            className={`font-mono text-h2 ${timerColor}`}
            animate={timeLeft < 60 ? { opacity: [1, 0.6, 1] } : {}}
            transition={timeLeft < 60 ? { duration: 1, repeat: Infinity } : {}}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <GlowButton size="sm" variant="ghost" onClick={endInterview} className="text-t3 hover:text-danger text-body-sm">
            End Interview
          </GlowButton>
        </div>
      </div>

      {/* Camera Zone */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: '48vh' }}>
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(7,7,12,0.3)' }} />

        {/* TL — Emotion Orb */}
        <div className="absolute top-4 left-4">
          <EmotionOrb emotion={emotion} />
        </div>

        {/* TR — Live Metrics */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <LiveMetricBadge icon={<Mic size={14} />} value={wpm > 0 ? `${wpm} WPM` : '— WPM'} />
          <LiveMetricBadge icon={<span style={{ fontSize: 12 }}>Hz</span>} value={pitch > 0 ? `±${Math.abs(pitch - 142)}Hz` : '—'} />
          <LiveMetricBadge icon={<AlertTriangle size={14} />} value={`${fillers} fillers`} danger={fillers > 5} />
        </div>

        {/* Left pitch bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{
            background: pitch > 160
              ? 'linear-gradient(to bottom, #EF4444, transparent)'
              : pitch > 140
              ? 'linear-gradient(to bottom, #6366F1, transparent)'
              : 'linear-gradient(to bottom, #0EA5E9, transparent)',
          }}
        />

        {/* Bottom transcript bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 flex items-center px-4 gap-3 border-t border-border-sub/50"
          style={{ backgroundColor: 'rgba(7,7,12,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <span className="text-label font-mono text-t4 mr-3 flex-shrink-0">TRANSCRIPT</span>
          <span className="font-mono text-mono-sm text-t2 truncate flex-1">
            {currentAnswer || (state === 'listening' ? 'Listening...' : '')}
          </span>
          {fillers > 0 && (
            <span className="flex-shrink-0 font-mono text-mono-sm text-warning border border-warning/30 rounded-chip px-2 py-0.5">
              {fillers} fillers
            </span>
          )}
        </div>

        {/* Silence overlay */}
        <AnimatePresence>
          {state === 'silence' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
            >
              <motion.p
                className="text-label font-mono text-danger tracking-widest"
                animate={{ opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                HOLD YOUR COMPOSURE
              </motion.p>
              <p className="font-mono text-3xl text-danger/60 mt-3">{silenceCountdown}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Question Zone */}
      <div className="flex-1 overflow-y-auto bg-bg1">
        <div className="max-w-3xl mx-auto px-8 py-6 w-full">
          {q && (
            <>
              {/* Question header */}
              <div className="flex justify-between items-center mb-5">
                <span className="font-mono text-mono-sm bg-bg3 border border-border rounded-chip px-3 py-1 text-t2">
                  Q{currentQ + 1}
                </span>
                <SectionBadge variant="time" label={q.type || 'Technical'} />
              </div>

              {/* Question text — word reveal */}
              <div className="text-h1 text-t1 leading-[1.4] mb-4 flex flex-wrap gap-x-2">
                {qWords.map((word, i) => (
                  <motion.span
                    key={`${currentQ}-${i}`}
                    custom={i}
                    variants={wordReveal}
                    initial="hidden"
                    animate={i < displayedWords ? 'visible' : 'hidden'}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              {/* Silence countdown bar */}
              <AnimatePresence>
                {state === 'silence' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-4"
                  >
                    <div className="h-1 bg-border rounded-chip overflow-hidden mb-1">
                      <motion.div
                        className="h-full bg-danger rounded-chip"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 4, ease: 'linear' }}
                      />
                    </div>
                    <p className="text-label font-mono text-t4">COMPOSURE WINDOW</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-t border-border-sub my-5" />

              {/* Answer area */}
              <div className="min-h-20">
                {state === 'listening' && sttAvailable && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <WaveformVisualizer active />
                      <span className="text-body-sm text-t3">Listening...</span>
                    </div>
                    {currentAnswer && (
                      <div className="bg-bg2 rounded-card p-4 border border-border-sub text-body text-t1 min-h-16">
                        {currentAnswer.split(' ').map((word, i) => {
                          const isFillerWord = ['um', 'uh', 'like', 'you know', 'basically', 'literally'].includes(word.toLowerCase())
                          return (
                            <span key={i}>
                              {isFillerWord ? (
                                <span className="rounded px-1 mx-0.5" style={{ backgroundColor: 'rgba(245,158,11,0.20)', color: '#F59E0B' }}>
                                  {word}
                                </span>
                              ) : (
                                <span>{word} </span>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {(state === 'listening' && !sttAvailable) && (
                  <textarea
                    className="w-full h-32 resize-none text-body text-t1 rounded-card p-4 border border-border focus:border-accent outline-none transition-colors"
                    style={{ backgroundColor: '#111118' }}
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={e => setCurrentAnswer(e.target.value)}
                  />
                )}

                {state === 'question' && displayedWords < qWords.length && (
                  <div className="h-16 flex items-center">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-accent"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border-sub my-5" />

              {/* Bottom metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Filler Words', value: fillers, color: fillers > 5 ? 'text-danger' : fillers > 2 ? 'text-warning' : 'text-success' },
                  { label: 'Eye Contact', value: 'OK', color: 'text-success' },
                  { label: 'Response Time', value: state === 'silence' ? `${4 - silenceCountdown}s` : '—', color: 'text-t2' },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <p className={`font-mono text-h1 ${m.color}`}>{m.value}</p>
                    <p className="text-label font-mono text-t3 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                {state === 'listening' && (
                  <GlowButton variant="secondary" onClick={stopAnswering}>
                    I'm Done Speaking
                  </GlowButton>
                )}
                {(state === 'question' || state === 'silence') && currentQ < (questions.length - 1) && (
                  <GlowButton variant="ghost" size="sm" onClick={() => {
                    clearInterval(silenceTimerRef.current!)
                    setCurrentQ(prev => prev + 1)
                    setState('question')
                  }}>
                    Skip Question
                  </GlowButton>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function getDefaultQuestions(): Question[] {
  return [
    { id: 'q1', text: 'Tell me about a time you had to debug a complex production issue under pressure. What was your approach?', type: 'Behavioral' },
    { id: 'q2', text: 'How would you design a URL shortener service that handles 100 million requests per day?', type: 'System Design' },
    { id: 'q3', text: 'Walk me through how you would optimize a slow database query causing timeouts in production.', type: 'Technical' },
    { id: 'q4', text: 'Describe your experience with distributed systems. What consistency models have you worked with?', type: 'Technical' },
    { id: 'q5', text: 'Tell me about a project where you had to make a significant technical tradeoff. What did you choose and why?', type: 'Behavioral' },
    { id: 'q6', text: 'How do you approach code reviews? What do you look for and how do you handle disagreements?', type: 'Behavioral' },
    { id: 'q7', text: 'Implement a function that finds the longest substring without repeating characters.', type: 'Coding' },
    { id: 'q8', text: "Where do you see the gap between your current skills and what this role requires? Be honest.", type: 'Resume' },
  ]
}
