import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

type Phase = 1 | 2 | 3

interface PhaseProgressBarProps {
  currentPhase: Phase
}

const phases = [
  { num: 1, label: 'Entry' },
  { num: 2, label: 'Interview' },
  { num: 3, label: 'Report' },
]

export function PhaseProgressBar({ currentPhase }: PhaseProgressBarProps) {
  return (
    <div className="bg-bg2 border-b border-border px-8 py-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center">
          {phases.map((phase, idx) => {
            const isDone = phase.num < currentPhase
            const isActive = phase.num === currentPhase
            const isFuture = phase.num > currentPhase

            return (
              <div key={phase.num} className="flex items-center flex-1 last:flex-none">
                {/* Dot */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isDone
                        ? 'bg-accent'
                        : isActive
                        ? 'bg-accent ring-4 ring-[rgba(99,102,241,0.20)] scale-110'
                        : 'border border-border bg-bg1'
                    }`}
                    initial={isDone ? { scale: 0 } : { scale: 1 }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {isDone && <Check size={6} className="text-white" strokeWidth={3} />}
                  </motion.div>
                  <span className="text-label font-mono text-t3 mt-1.5 whitespace-nowrap">{phase.label}</span>
                </div>

                {/* Line */}
                {idx < phases.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-border overflow-hidden relative -mt-4">
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 bg-accent"
                      initial={{ width: '0%' }}
                      animate={{ width: isDone ? '100%' : '0%' }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
