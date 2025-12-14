import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Strategy } from './types'
import { CommandInput } from './components/command-input-ui'
import { StrategyDisplay } from './components/strategy-display'
import { ConnectionStatus } from './components/connection-status'
import { OrbitControls } from '@react-three/drei'
import { Projectile } from './components/projectile'
import { AIBot } from './components/aibot'
import { Physics } from '@react-three/rapier'
import { Character } from './components/character'
import { Floor } from './components/floor'
import { BoundaryWalls } from './components/boundary-walls'

export default function App() {
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const [projectiles, setProjectiles] = useState<Array<{
    id: string
    origin: [number, number, number]
    direction: [number, number, number]
    team: 'red' | 'blue'
  }>>([])
  const projectileCounter = useRef(0)
  
  const handleShoot = (
    origin: [number, number, number], 
    direction: [number, number, number], 
    team: 'red' | 'blue'
  ) => {
    const id = `projectile-${team}-${projectileCounter.current++}`
    console.log(`💥 Creating projectile: ${id} at`, origin, 'direction:', direction)
    setProjectiles(prev => [...prev, { id, origin, direction, team }])
  }
  
  const handleProjectileHit = (id: string) => {
    setProjectiles(prev => prev.filter(p => p.id !== id))
  }
  
  const handleBotDamage = (botId: string, amount: number) => {
    console.log(`🎯 ${botId} took ${amount} damage`)
  }
  
  useEffect(() => {
    let reconnectTimeout: number;
    let isConnecting = false
    
    const connectWebSocket = () => {
      if (isConnecting) {
        console.log('⏳ Connection already in progress...')
        return
      }
      
      isConnecting = true
      console.log('🔄 Attempting to connect to backend...')
      
      // Use environment variable or fallback to localhost
      const wsUrl = 'wss://ai-commander-backend.onrender.com/ws/commander' || 'ws://localhost:8000/ws/commander'
      console.log('🔗 Connecting to:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ Connected to AI Commander Backend')
        setConnected(true)
        isConnecting = false
      }

      ws.onmessage = (event) => {
        console.log('📩 Received from backend:', event.data)
        try {
          const data = JSON.parse(event.data)
          
          // Handle connection message
          if (data.type === 'connection') {
            console.log('🤝 Connection message:', data.message)
            return
          }
          
          // Handle strategy update
          if (data.formation && data.target !== undefined && data.aggression !== undefined) {
            setCurrentStrategy(data)
            console.log('📊 Strategy updated:', data)
          }
        } catch (error) {
          console.error('❌ Error parsing message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setConnected(false)
        isConnecting = false
      }

      ws.onclose = () => {
        console.log('🔌 WebSocket connection closed')
        setConnected(false)
        isConnecting = false
        
        // Try to reconnect after 3 seconds
        reconnectTimeout = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...')
          connectWebSocket()
        }, 3000)
      }
    }

    connectWebSocket()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      isConnecting = false
    }
  }, [])
  
  const handleCommand = (command: string) => {
    console.log('🎮 Sending command:', command)
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command }))
      console.log('✅ Command sent to backend')
    } else {
      console.error('❌ Cannot send command - WebSocket not connected')
    }
  }
  
  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      
      <Canvas 
        shadows 
        camera={{ position: [25, 20, 25], fov: 50 }}
      >
        <color attach="background" args={['#87CEEB']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[15, 25, 15]} 
          castShadow 
          intensity={1}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        
        <Physics gravity={[0, -9.81, 0]}>
          <Character />
          <Floor />
          <BoundaryWalls />
          
          {/* Red Team AI Bots */}
          <AIBot 
            id="red-1" 
            team="red" 
            startPos={[-15, 1, -15]} 
            strategy={currentStrategy}
            onTakeDamage={handleBotDamage}
            onShoot={handleShoot}
          />
          <AIBot 
            id="red-2" 
            team="red" 
            startPos={[-15, 1, -10]} 
            strategy={currentStrategy}
            onTakeDamage={handleBotDamage}
            onShoot={handleShoot}
          />
          <AIBot 
            id="red-3" 
            team="red" 
            startPos={[-15, 1, -5]} 
            strategy={currentStrategy}
            onTakeDamage={handleBotDamage}
            onShoot={handleShoot}
          />
          <AIBot 
            id="red-4" 
            team="red" 
            startPos={[-10, 1, -15]} 
            strategy={currentStrategy}
            onTakeDamage={handleBotDamage}
            onShoot={handleShoot}
          />
          
          {/* Blue Team AI Bots */}
          <AIBot 
            id="blue-1" 
            team="blue" 
            startPos={[15, 1, 15]} 
            strategy={null}
            onTakeDamage={handleBotDamage}
            onShoot={handleShoot}
          />
          <AIBot 
            id="blue-2" 
            team="blue" 
            startPos={[15, 1, 10]} 
            strategy={null}
            onTakeDamage={handleBotDamage}
            onShoot={handleShoot}
          />
          <AIBot 
            id="blue-3" 
            team="blue" 
            startPos={[15, 1, 5]} 
            strategy={null}
            onTakeDamage={handleBotDamage}
            onShoot={handleShoot}
          />
          <AIBot
            id="blue-4" 
            team="blue" 
            startPos={[10, 1, 15]} 
            strategy={null}
            onTakeDamage={handleBotDamage}
            onShoot={handleShoot}
          />
          
          {/* Render all active projectiles */}
          {projectiles.map(proj => (
            <Projectile
              key={proj.id}
              id={proj.id}
              origin={proj.origin}
              direction={proj.direction}
              team={proj.team}
              onHit={handleProjectileHit}
            />
          ))}
        </Physics>
        
        <OrbitControls 
          target={[0, 2, 0]}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={10}
          maxDistance={50}
        />
        
        <gridHelper args={[40, 40, '#444', '#222']} position={[0, 0.01, 0]} />
      </Canvas>
      
      <ConnectionStatus connected={connected} />
      
      <div style={{
        position: 'absolute',
        top: 80,
        left: 20,
        color: 'white',
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.85)',
        padding: '20px',
        borderRadius: '10px',
        fontSize: '14px',
        lineHeight: '1.8',
        maxWidth: '300px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#FFD700' }}>
          🤖 AI Vision Arena
        </div>
        
        <div style={{ marginBottom: '10px', fontSize: '13px' }}>
          <div style={{ fontWeight: 'bold', color: '#ff0000' }}>🔴 Red Team: 4 bots (You control)</div>
          <div style={{ fontWeight: 'bold', color: '#0000ff' }}>🔵 Blue Team: 4 bots (Auto)</div>
        </div>
        
        <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.6' }}>
          Each bot has:
          <br/>• Vision cone (wireframe)
          <br/>• AI behavior system
          <br/>• Health bar above body
          <br/>• Action status (top light)
          <br/>• Combat system (shoots projectiles)
        </div>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(76, 195, 247, 0.2)', borderRadius: '5px', fontSize: '11px' }}>
          💡 Bots automatically shoot at enemies within range!
        </div>
      </div>
      
      <CommandInput onCommand={handleCommand} connected={connected} />
      <StrategyDisplay strategy={currentStrategy} />
    </>
  )
}
