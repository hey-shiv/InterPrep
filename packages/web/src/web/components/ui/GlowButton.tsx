import { motion } from 'framer-motion'
import { ReactNode } from 'react'

type GlowButtonProps = {
  children: ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const sizeClasses = {
  sm: 'px-4 py-2 text-body-sm h-9',
  md: 'px-6 py-3 text-body-lg h-11',
  lg: 'px-8 py-4 text-h3 h-13',
}

export function GlowButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className = '',
}: GlowButtonProps) {
  const isDisabled = disabled || loading

  const baseClass = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[8px] transition-all duration-200 ease-out cursor-pointer select-none'

  const variantClass = {
    primary: isDisabled
      ? 'bg-bg3 text-t4 cursor-not-allowed'
      : 'bg-accent text-bg0 shadow-glow-sm hover:shadow-glow-md',
    secondary: 'bg-transparent border border-border text-t1 hover:border-accent hover:text-accent hover:bg-[rgba(198,244,50,0.06)]',
    ghost: 'bg-transparent text-t2 hover:text-t1 hover:bg-bg3',
    danger: 'bg-[rgba(239,68,68,0.10)] text-danger border border-[rgba(239,68,68,0.30)] hover:bg-[rgba(239,68,68,0.20)]',
  }[variant]

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={isDisabled ? {} : { scale: 1.01 }}
      className={`${baseClass} ${sizeClasses[size]} ${variantClass} ${fullWidth ? 'w-full' : ''} ${loading ? 'opacity-80' : ''} ${className}`}
    >
      {loading ? (
        <>
          <span className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-current"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </span>
        </>
      ) : children}
    </motion.button>
  )
}
