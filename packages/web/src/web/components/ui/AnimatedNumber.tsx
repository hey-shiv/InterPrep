import { useMotionValue, useSpring, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export function AnimatedNumber({ value, decimals = 1, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 14 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (isInView) motionVal.set(value)
  }, [isInView, value, motionVal])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => setDisplay(v.toFixed(decimals)))
    return unsubscribe
  }, [spring, decimals])

  return <span ref={ref}>{display}{suffix}</span>
}
