import type { Strategy } from "../types"

export function StrategyDisplay({ strategy }: { strategy: Strategy | null }) {
  if (!strategy) return null
  
  return (
    <div style={{
      position: 'absolute',
      top: 80,
      right: 20,
      background: 'rgba(0,0,0,0.9)',
      padding: '20px',
      borderRadius: '10px',
      width: '300px',
      color: 'white',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#FF6B6B' }}>
        📊 Current Strategy
      </div>
      
      <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#FFD700' }}>Formation:</span> {strategy.formation}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#FFD700' }}>Target:</span> {strategy.target}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#FFD700' }}>Aggression:</span>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: '#333', 
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '5px'
          }}>
            <div style={{ 
              width: `${strategy.aggression * 100}%`, 
              height: '100%', 
              background: strategy.aggression > 0.7 ? '#ff0000' : strategy.aggression > 0.4 ? '#ffaa00' : '#00ff00',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
