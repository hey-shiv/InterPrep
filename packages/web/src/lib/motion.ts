import { Variants } from 'framer-motion'

// Page enter
export const pageVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } },
}

// Scroll-triggered item reveal
export const revealVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

// Stagger container
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

// Card hover
export const cardHover = {
  rest:  { scale: 1,    boxShadow: '0 1px 3px rgba(0,0,0,0.4)' },
  hover: { scale: 1.01, boxShadow: '0 0 0 1px #6366F1, 0 0 24px -6px rgba(99,102,241,0.4)',
           transition: { duration: 0.2, ease: 'easeOut' } },
}

// Verdict badge entrance
export const verdictBadge: Variants = {
  hidden:  { scale: 0.4, opacity: 0 },
  visible: { scale: 1, opacity: 1,
             transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.2 } },
}

// Word-by-word text reveal
export const wordReveal: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.035, duration: 0.4, ease: 'easeOut' },
  }),
}

// Chart line draw-in
export const chartLine: Variants = {
  hidden:  { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1,
             transition: { pathLength: { duration: 1.4, ease: 'easeInOut' },
                           opacity: { duration: 0.3 } } },
}

// Page transition slide
export const slideRight: Variants = {
  hidden:  { x: '4%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit:    { x: '-4%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
}

export const slideUp: Variants = {
  hidden:  { y: '6%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  exit:    { y: '-4%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
}

// Easing constants
export const ease = {
  out:    [0.16, 1, 0.3, 1] as [number, number, number, number],
  in:     [0.7, 0, 0.84, 0] as [number, number, number, number],
  spring: { type: 'spring' as const, stiffness: 280, damping: 22 },
}
