type BadgeVariant = 'core experience' | 'the wow moment' | 'downloadable' | 'live' | 'time' | string

interface SectionBadgeProps {
  variant: BadgeVariant
  label?: string
}

const badgeConfig: Record<string, { bg: string; text: string; border: string }> = {
  'core experience': {
    bg: 'bg-[#1A103A]',
    text: 'text-accent-light',
    border: 'border-[#4C3F8A]',
  },
  'the wow moment': {
    bg: 'bg-[#1A1200]',
    text: 'text-warning',
    border: 'border-[#7A5A00]',
  },
  downloadable: {
    bg: 'bg-[#061A0E]',
    text: 'text-success',
    border: 'border-[#0F5C28]',
  },
  live: {
    bg: 'bg-[#1A0606]',
    text: 'text-danger',
    border: 'border-[#7A1010]',
  },
  time: {
    bg: 'bg-bg3',
    text: 'text-t3',
    border: 'border-border',
  },
}

export function SectionBadge({ variant, label }: SectionBadgeProps) {
  const config = badgeConfig[variant] || badgeConfig['time']
  const displayLabel = label || variant

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-chip px-3 py-1 text-label font-sans uppercase border tracking-wide ${config.bg} ${config.text} ${config.border}`}
    >
      {variant === 'live' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger" />
        </span>
      )}
      {displayLabel}
    </span>
  )
}
