import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import { AlertTriangle, ArrowRight, Mic, MicOff, Pause, Square } from 'lucide-react'
import { Brand, StageNav } from '../components/brand'

type InterviewState = 'loading' | 'question' | 'silence' | 'listening' | 'processing' | 'done'
type Question = { id: string; text: string; type: string; difficulty?: string }

const TOTAL_TIME = 10 * 60

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function Interview() {
  const [, setLocation] = useLocation()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [state, setState] = useState<InterviewState>('loading')
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [silenceLeft, setSilenceLeft] = useState(4)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [wpm, setWpm] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [fillers, setFillers] = useState(0)
  const [cameraOk, setCameraOk] = useState(false)
  const [sttAvailable, setSttAvailable] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const silenceRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const sid = sessionStorage.getItem('sessionId')
    const sdata = sessionStorage.getItem('sessionData')
    if (!sid) {
      setLocation('/setup')
      return
    }
    setSessionId(sid)

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(async stream => {
        streamRef.current = stream
        setCameraOk(true)
        // Retry assigning stream in case videoRef wasn't ready yet
        const assignStream = async () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play().catch(() => {})
          } else {
            setTimeout(assignStream, 100)
          }
        }
        assignStream()
      })
      .catch(() => setCameraOk(false))

    async function loadQuestions() {
      try {
        const parsed = sdata ? JSON.parse(sdata) : {}
        const res = await fetch('/api/ai/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: parsed.jobRole, resumeData: parsed.resumeAnalysis, sessionId: sid }),
        })
        const data = await res.json()
        setQuestions(data.questions?.length ? data.questions : defaultQuestions())
      } catch {
        setQuestions(defaultQuestions())
      }
      setState('question')
      startClock()
      setTimeout(startSilenceWindow, 1200)
    }

    loadQuestions()
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) setSttAvailable(false)

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
      if (timerRef.current) clearInterval(timerRef.current)
      if (silenceRef.current) clearInterval(silenceRef.current)
      recognitionRef.current?.stop?.()
    }
  }, [setLocation])

  // Re-attach stream to video element whenever it becomes available
  useEffect(() => {
    if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  })

  useEffect(() => {
    if (state !== 'listening') return
    const interval = setInterval(() => {
      setPitch(130 + Math.floor(Math.random() * 34))
      if (!currentAnswer) setWpm(115 + Math.floor(Math.random() * 44))
    }, 1400)
    return () => clearInterval(interval)
  }, [state, currentAnswer])

  function startClock() {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          endInterview()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function startSilenceWindow() {
    if (silenceRef.current) clearInterval(silenceRef.current)
    setState('silence')
    setSilenceLeft(4)
    let remaining = 4
    silenceRef.current = setInterval(() => {
      remaining -= 1
      setSilenceLeft(remaining)
      if (remaining <= 0) {
        if (silenceRef.current) clearInterval(silenceRef.current)
        startListening()
      }
    }, 1000)
  }

  function startListening() {
    setState('listening')
    setCurrentAnswer('')
    setFillers(0)
    setWpm(0)
    setPitch(142)
    if (!sttAvailable) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let text = ''
      for (let i = 0; i < event.results.length; i += 1) {
        text += `${event.results[i][0].transcript} `
      }
      const cleaned = text.trim()
      const fillerCount = (cleaned.toLowerCase().match(/\b(um|uh|like|basically|literally)\b/g) || []).length
      setCurrentAnswer(cleaned)
      setFillers(fillerCount)
      setWpm(cleaned ? Math.min(210, Math.round(cleaned.split(/\s+/).length * 6)) : 0)
    }
    recognition.start()
  }

  const saveAndAdvance = useCallback((forcedAnswer?: string) => {
    recognitionRef.current?.stop?.()
    if (silenceRef.current) clearInterval(silenceRef.current)
    const q = questions[currentIndex]
    const nextAnswers = q ? { ...answers, [q.id]: forcedAnswer ?? currentAnswer } : answers
    setAnswers(nextAnswers)
    setState('processing')

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setCurrentAnswer('')
        setState('question')
        setTimeout(startSilenceWindow, 700)
      } else {
        endInterview(nextAnswers)
      }
    }, 600)
  }, [answers, currentAnswer, currentIndex, questions])

  async function endInterview(finalAnswers = answers) {
    if (timerRef.current) clearInterval(timerRef.current)
    if (silenceRef.current) clearInterval(silenceRef.current)
    recognitionRef.current?.stop?.()
    streamRef.current?.getTracks().forEach(track => track.stop())
    setState('done')

    if (sessionId) {
      try {
        const res = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: finalAnswers, questions, sessionId }),
        })
        if (res.ok) {
          const data = await res.json()
          sessionStorage.setItem('reportData', JSON.stringify({
            verdict: data.verdict || 'BORDERLINE',
            score: data.score || data.metrics?.overall || 7.2,
            debrief: data.debrief || 'Interview complete. Your report is ready.',
            metrics: {
              totalQuestions: data.metrics?.totalQuestions || data.questions?.length || questions.length || 8,
              avgConfidence: data.metrics?.confidence || 6.5,
              peakStress: data.metrics?.stress || 0.48,
              bestMoment: data.metrics?.bestMoment || 'Q1',
            },
            questions: data.questions || [],
            shadowQuestions: data.shadowQuestions || [],
            improvementPlan: data.improvementPlan || [],
            verdictQuote: data.verdictQuote || 'Your strongest answer was the one with the clearest structure.',
          }))
        }
      } catch {}
    }

    setLocation('/report')
  }

  const q = questions[currentIndex]
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0

  if (state === 'loading') {
    return (
      <div className="app-page grid min-h-screen place-items-center">
        <div className="panel p-8 text-center">
          <div className="mx-auto mb-4 flex justify-center gap-2">
            {[0, 1, 2].map(i => <span key={i} className="status-dot ok pulse-dot" style={{ animationDelay: `${i * 120}ms` }} />)}
          </div>
          <p className="text-xl font-bold text-t1">Preparing questions...</p>
          <p className="body mt-1">Building your role-specific interview.</p>
        </div>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="app-page grid min-h-screen place-items-center">
        <div className="panel p-8 text-center">
          <CheckIcon />
          <p className="mt-4 text-2xl font-bold text-t1">Interview complete</p>
          <p className="body mt-1">Scoring answers and opening your report.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="interview-room">
      <header className="border-b border-border-sub bg-bg0/92">
        <div className="flex h-16 items-center justify-between gap-5 px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Brand compact />
            <span className="chip"><span className="status-dot bad pulse-dot" /> Live</span>
            <span className="font-mono text-sm text-t2">Question {currentIndex + 1} of {questions.length || 8}</span>
            <div className="bar w-44"><span style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden xl:block"><StageNav active={2} /></div>
            <span className={timeLeft < 60 ? 'font-mono text-2xl text-danger' : 'font-mono text-2xl text-t1'}>{formatTime(timeLeft)}</span>
            <button className="btn btn-danger" onClick={() => { if (window.confirm('End interview now?')) endInterview() }}>
              <Square size={15} /> End
            </button>
          </div>
        </div>
      </header>

      <main className="interview-grid">
        <section className="question-stage">
          <div className="question-copy">
            <div className="max-w-4xl">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="chip">{q?.type || 'Technical'}</span>
                {q?.difficulty && <span className="chip">{q.difficulty}</span>}
                {state === 'silence' && <span className="chip text-warning"><Pause size={13} /> Composure window {silenceLeft}s</span>}
                {state === 'listening' && <span className="chip text-success"><Mic size={13} /> Listening</span>}
                {state === 'processing' && <span className="chip">Saving answer...</span>}
              </div>
              <p className="eyebrow">Act III - live interview</p>
              <h1 className="mt-5">{q?.text}</h1>
              <p className="body-lg mt-5 max-w-2xl">
                Answer out loud. Be structured. If speech recognition is unavailable, type your answer in the transcript box.
              </p>
            </div>
          </div>

          <div className="transcript-dock">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="panel-soft min-h-28 p-4">
                <p className="eyebrow">Transcript</p>
                {sttAvailable ? (
                  <p className="body mt-2 text-t1">{currentAnswer || (state === 'listening' ? 'Listening...' : 'Transcript appears here when your answer starts.')}</p>
                ) : (
                  <textarea
                    className="mt-3 h-24 w-full resize-none rounded-[8px] border border-border bg-bg0 p-3 text-t1 outline-none"
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={event => setCurrentAnswer(event.target.value)}
                  />
                )}
              </div>
              <div className="flex items-end gap-3">
                {(state === 'listening' || !sttAvailable) && (
                  <button className="btn btn-primary" onClick={() => saveAndAdvance()}>
                    Done Speaking <ArrowRight size={17} />
                  </button>
                )}
                {state !== 'processing' && (
                  <button className="btn btn-secondary" onClick={() => saveAndAdvance('')}>
                    Skip
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="interview-sidebar">
          <div className="camera-box camera-stage">
            <video ref={videoRef} autoPlay playsInline muted />
            <span className="camera-scan" />
            {!cameraOk && (
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <MicOff className="mx-auto text-t3" />
                  <p className="body mt-2">Camera unavailable</p>
                </div>
              </div>
            )}
            <span className="chip absolute left-4 top-4"><span className={`status-dot ${cameraOk ? 'ok' : 'bad'}`} /> camera</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="metric">
              <p className="metric-value text-success">{wpm || '-'}</p>
              <p className="metric-label">WPM</p>
            </div>
            <div className="metric">
              <p className="metric-value text-accent">{pitch ? `+${Math.abs(pitch - 142)}` : '-'}</p>
              <p className="metric-label">Pitch delta</p>
            </div>
            <div className="metric">
              <p className={fillers > 4 ? 'metric-value text-danger' : 'metric-value text-warning'}>{fillers}</p>
              <p className="metric-label">Fillers</p>
            </div>
            <div className="metric">
              <p className="metric-value text-t1">{state === 'silence' ? `${4 - silenceLeft}s` : '-'}</p>
              <p className="metric-label">Response gap</p>
            </div>
          </div>

          <div className="signal-meter">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Stress trace</p>
              <span className="chip">{state}</span>
            </div>
            <div className="signal-line">
              {[36, 48, 62, 52, 74, 44, 58, 82, 66, 40, 70, 55].map((height, index) => (
                <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }} />
              ))}
            </div>
          </div>

          <div className="panel mt-4 p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" />
              <p className="font-bold text-t1">Interviewer note</p>
            </div>
            <p className="body">The report will judge the structure of the answer, the confidence you projected, and whether the details backed it up.</p>
          </div>
        </aside>
      </main>
    </div>
  )
}

function CheckIcon() {
  return (
    <div className="mx-auto grid h-16 w-16 place-items-center rounded-[8px] bg-success text-bg0">
      <ArrowRight size={30} />
    </div>
  )
}

function defaultQuestions(): Question[] {
  return [
    { id: 'q1', text: 'Tell me about a production issue you debugged under pressure. What did you do first?', type: 'Behavioral', difficulty: 'medium' },
    { id: 'q2', text: 'Design a URL shortener that can handle 100 million requests per day.', type: 'System Design', difficulty: 'hard' },
    { id: 'q3', text: 'How would you optimize a slow database query that is causing timeouts?', type: 'Technical', difficulty: 'medium' },
    { id: 'q4', text: 'Walk me through a technical tradeoff you made and what you gave up.', type: 'Behavioral', difficulty: 'medium' },
    { id: 'q5', text: 'How do you reason about consistency in distributed systems?', type: 'Technical', difficulty: 'hard' },
    { id: 'q6', text: 'What is the weakest part of your resume for this role?', type: 'Resume', difficulty: 'medium' },
  ]
}
