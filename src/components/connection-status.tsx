export function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: connected ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)',
      padding: '10px 20px',
      borderRadius: '20px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      zIndex: 1000
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: 'white',
        animation: connected ? 'pulse 2s infinite' : 'none'
      }} />
      {connected ? '🟢 Connected to Backend' : '🔴 Backend Disconnected'}
    </div>
  )
}
