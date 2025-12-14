import { useState } from "react"

export function CommandInput({ onCommand, connected }: { onCommand: (command: string) => void, connected: boolean }) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  
  const handleSend = () => {
    if (input.trim()) {
      onCommand(input)
      setHistory(prev => [...prev, input].slice(-5))
      setInput('')
    }
  }
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: 20,
      background: 'rgba(0,0,0,0.9)',
      padding: '20px',
      borderRadius: '10px',
      width: '400px',
      color: 'white',
      fontFamily: 'monospace',
      border: connected ? '2px solid #00ff00' : '2px solid #ff0000'
    }}>
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#4FC3F7' }}>
        🤖 AI Commander
      </div>
      
      {!connected && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.2)',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px',
          fontSize: '12px',
          border: '1px solid rgba(255, 0, 0, 0.5)'
        }}>
          ⚠️ Backend not connected. Start backend server first.
        </div>
      )}
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Give natural language command..."
          disabled={!connected}
          style={{
            width: '100%',
            padding: '10px',
            background: connected ? '#222' : '#111',
            border: '2px solid #4FC3F7',
            borderRadius: '5px',
            color: connected ? 'white' : '#666',
            fontFamily: 'monospace',
            fontSize: '14px',
            marginBottom: '10px',
            boxSizing: 'border-box',
            cursor: connected ? 'text' : 'not-allowed'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!connected}
          style={{
            width: '100%',
            padding: '10px',
            background: connected ? '#4FC3F7' : '#333',
            border: 'none',
            borderRadius: '5px',
            color: connected ? 'black' : '#666',
            fontWeight: 'bold',
            cursor: connected ? 'pointer' : 'not-allowed',
            fontFamily: 'monospace'
          }}
        >
          {connected ? 'Send Command' : 'Backend Offline'}
        </button>
      </div>
      
      {history.length > 0 && (
        <div style={{ marginTop: '15px', fontSize: '12px' }}>
          <div style={{ opacity: 0.7, marginBottom: '5px' }}>Recent Commands:</div>
          {history.map((cmd, i) => (
            <div key={i} style={{ opacity: 0.6, marginBottom: '3px' }}>
              → {cmd}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '11px', opacity: 0.5, borderTop: '1px solid #333', paddingTop: '10px' }}>
        Try: "Attack enemies aggressively", "Defend base", "Spread out and patrol"
      </div>
    </div>
  )
}
