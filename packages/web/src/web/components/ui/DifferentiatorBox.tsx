import { motion } from 'framer-motion'
import { useScrollReveal } from '../../../hooks/useScrollReveal'

interface DifferentiatorBoxProps {
  label?: string
  text: string
  bullets?: string[]
  size?: 'sm' | 'lg'
}

export function DifferentiatorBox({ label = 'THE THING NOBODY ELSE DOES', text, bullets, size = 'sm' }: DifferentiatorBoxProps) {
  const { ref, controls } = useScrollReveal()

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        hidden: { opacity: 0, x: -8 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
      }}
      className={`relative rounded-[10px] border border-border overflow-hidden ${
        size === 'lg' ? 'p-8 border-2' : 'p-5'
      }`}
      style={{
        background: 'linear-gradient(to right, rgba(99,102,241,0.06), transparent)',
      }}
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{
          background: 'linear-gradient(to bottom, #6366F1, rgba(99,102,241,0.4), transparent)',
        }}
      />

      <p className="font-mono text-label uppercase tracking-[0.09em] text-t3 mb-2 pl-1">
        {label}
      </p>

      <p className={`text-t2 italic leading-[1.7] pl-1 ${size === 'lg' ? 'text-h1' : 'text-body'}`}>
        {text}
      </p>

      {bullets && bullets.length > 0 && (
        <div className="flex flex-col gap-2 mt-4 pl-1">
          {bullets.map((b, i) => (
            <p key={i} className="text-body-sm text-t2">✦ {b}</p>
          ))}
        </div>
      )}
    </motion.div>
  )
}
