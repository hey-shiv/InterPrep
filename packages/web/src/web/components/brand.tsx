import { ArrowRight } from 'lucide-react'

type BrandProps = {
  compact?: boolean
  className?: string
}

export function InterPrepMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`interprep-mark ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <path className="mark-frame" d="M32 5 58 20v24L32 59 6 44V20L32 5Z" />
      <path className="mark-line" d="M20 38c5.4 0 5.4-12 10.8-12S36.2 38 41.6 38 47 26 52 26" />
      <path className="mark-core" d="M32 16v32M18 32h28" />
      <circle className="mark-dot" cx="32" cy="32" r="4" />
    </svg>
  )
}

export function Brand({ compact = false, className = '' }: BrandProps) {
  return (
    <a className={`brand ${className}`} href="/">
      <span className="brand-mark"><InterPrepMark /></span>
      <span className="brand-copy">
        <strong>InterPrep</strong>
        {!compact && <small>Interview OS</small>}
      </span>
    </a>
  )
}

export function EditionBadge() {
  return (
    <span className="edition-badge">
      <InterPrepMark />
      Winter '26
    </span>
  )
}

export function StageNav({ active = 0 }: { active?: number }) {
  const steps = ['Brief', 'Baseline', 'Interview', 'Report']

  return (
    <div className="stage-nav" aria-label="Interview progress">
      {steps.map((step, index) => (
        <span key={step} className={index === active ? 'active' : index < active ? 'complete' : ''}>
          <i>{String(index + 1).padStart(2, '0')}</i>
          {step}
        </span>
      ))}
    </div>
  )
}

export function StartButton({ onClick, children = 'Start Interview' }: { onClick: () => void; children?: string }) {
  return (
    <button className="btn btn-primary btn-sheen" onClick={onClick}>
      {children} <ArrowRight size={17} />
    </button>
  )
}
