interface PhaseLabelProps {
  phase?: 'entry' | 'interview' | 'report'
  text: string
  showLine?: boolean
}

const phaseColors: Record<string, string> = {
  entry: 'text-phase-entry',
  interview: 'text-phase-interview',
  report: 'text-phase-report',
}

export function PhaseLabel({ phase, text, showLine = true }: PhaseLabelProps) {
  return (
    <div className="flex items-center">
      <p
        className={`font-mono text-label uppercase tracking-[0.09em] text-t3 ${
          phase ? phaseColors[phase] : ''
        }`}
      >
        {text}
      </p>
      {showLine && (
        <div className="flex-1 h-px ml-3" style={{
          background: 'linear-gradient(to right, #2A2A3A, transparent)'
        }} />
      )}
    </div>
  )
}
