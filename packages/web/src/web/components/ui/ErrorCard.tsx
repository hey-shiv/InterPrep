import { AlertTriangle } from 'lucide-react'
import { GlowButton } from './GlowButton'

interface ErrorCardProps {
  title: string
  message?: string
  onRetry?: () => void
}

export function ErrorCard({ title, message, onRetry }: ErrorCardProps) {
  return (
    <div
      className="relative rounded-card p-5 border"
      style={{
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderColor: 'rgba(239,68,68,0.30)',
        borderLeft: '3px solid #EF4444',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={20} className="text-danger" />
        <p className="text-h3 text-t1">{title}</p>
      </div>
      {message && <p className="text-body text-t2 mt-2">{message}</p>}
      {onRetry && (
        <div className="mt-4">
          <GlowButton size="sm" variant="secondary" onClick={onRetry}>Try Again</GlowButton>
        </div>
      )}
    </div>
  )
}
