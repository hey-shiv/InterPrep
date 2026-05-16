import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const messages = [
  'Reading your resume...',
  'Finding gaps...',
  'Building your briefing...',
  'Analyzing experience...',
  'Preparing questions...',
]

export function AILoadingCard({ customMessages }: { customMessages?: string[] }) {
  const msgs = customMessages || messages
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % msgs.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [msgs.length])

  return (
    <div className="bg-bg2 border border-border rounded-card p-6 text-center">
      <div className="flex gap-1.5 justify-center mb-4">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-accent"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          className="text-body-sm text-t3 italic"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          {msgs[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
