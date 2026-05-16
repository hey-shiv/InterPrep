interface WaveformVisualizerProps {
  active?: boolean
}

const delays = ['0s', '0.1s', '0.2s', '0.3s', '0.15s']

export function WaveformVisualizer({ active = true }: WaveformVisualizerProps) {
  return (
    <div className="flex items-end gap-0.5 h-6">
      {delays.map((delay, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-colors duration-300 ${active ? 'bg-accent animate-waveform' : 'bg-t4'}`}
          style={{
            animationDelay: delay,
            height: active ? '100%' : '30%',
            minHeight: '4px',
          }}
        />
      ))}
    </div>
  )
}
