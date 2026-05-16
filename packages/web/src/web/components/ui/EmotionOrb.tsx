import { motion, AnimatePresence } from 'framer-motion'

type EmotionType = 'neutral' | 'confident' | 'nervous' | 'engaged' | 'confused'

const emotionConfig: Record<EmotionType, { color: string; label: string; pulseSpeed: number }> = {
  neutral:   { color: '#6366F1', label: 'Neutral',   pulseSpeed: 2.5 },
  confident: { color: '#22C55E', label: 'Confident', pulseSpeed: 3.5 },
  nervous:   { color: '#EF4444', label: 'Nervous',   pulseSpeed: 1.2 },
  engaged:   { color: '#0EA5E9', label: 'Engaged',   pulseSpeed: 2.0 },
  confused:  { color: '#F59E0B', label: 'Confused',  pulseSpeed: 1.8 },
}

interface EmotionOrbProps {
  emotion?: EmotionType
  size?: 'sm' | 'md'
}

export function EmotionOrb({ emotion = 'neutral', size = 'md' }: EmotionOrbProps) {
  const config = emotionConfig[emotion]
  const isSmall = size === 'sm'

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={emotion}
          className="relative flex items-center justify-center"
          style={{ width: isSmall ? 32 : 44, height: isSmall ? 32 : 44 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: isSmall ? 32 : 44,
              height: isSmall ? 32 : 44,
              backgroundColor: config.color,
              opacity: 0.12,
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: config.pulseSpeed, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          {/* Middle ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: isSmall ? 20 : 28,
              height: isSmall ? 20 : 28,
              backgroundColor: config.color,
              opacity: 0.35,
            }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: config.pulseSpeed, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner dot */}
          <div
            className="relative rounded-full"
            style={{
              width: isSmall ? 10 : 14,
              height: isSmall ? 10 : 14,
              backgroundColor: config.color,
            }}
          />
        </motion.div>
      </AnimatePresence>
      {!isSmall && (
        <p className="text-label text-t3 mt-1 font-mono">{config.label}</p>
      )}
    </div>
  )
}
