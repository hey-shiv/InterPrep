import { ReactNode } from 'react'

interface LiveMetricBadgeProps {
  icon: ReactNode
  value: string
  danger?: boolean
}

export function LiveMetricBadge({ icon, value, danger = false }: LiveMetricBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-chip px-3 py-1.5 border"
      style={{
        backgroundColor: 'rgba(7,7,12,0.9)',
        backdropFilter: 'blur(8px)',
        borderColor: 'rgba(42,42,58,0.5)',
      }}
    >
      <span className={danger ? 'text-danger' : 'text-phase-entry'} style={{ fontSize: 14 }}>
        {icon}
      </span>
      <span className={`font-mono text-mono-sm text-t1 ${danger ? 'text-danger' : ''}`}>
        {value}
      </span>
    </div>
  )
}
