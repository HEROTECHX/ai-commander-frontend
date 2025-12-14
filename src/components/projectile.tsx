import { Sphere } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { RapierRigidBody, RigidBody } from "@react-three/rapier"
import { useEffect, useRef } from "react"
import type { ProjectileProps } from "../types"

export function Projectile({ 
  id, 
  origin, 
  direction, 
  team, 
  onHit 
}: ProjectileProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const lifespan = useRef(5.0)
  const hasInitialized = useRef(false)
  
  useEffect(() => {
    console.log(`🚀 Projectile ${id} spawned`)
    return () => {
      console.log(`💨 Projectile ${id} destroyed`)
    }
  }, [id])
  
  useFrame((_state, delta) => {
    if (!rigidBodyRef.current) return
    
    // Initialize velocity on first frame
    if (!hasInitialized.current) {
      const speed = 25
      rigidBodyRef.current.setLinvel({
        x: direction[0] * speed,
        y: direction[1] * speed,
        z: direction[2] * speed
      }, true)
      hasInitialized.current = true
      console.log(`⚡ Projectile ${id} velocity set:`, direction)
    }
    
    lifespan.current -= delta
    
    // Check for hits with enemy bots
    const position = rigidBodyRef.current.translation()
    
    if (window.botRegistry) {
      for (const bot of Object.values(window.botRegistry)) {
        if (bot.team === team) continue
        
        const botPos = bot.rigidBodyRef.current?.translation()
        if (!botPos) continue
        
        const dist = Math.sqrt(
          Math.pow(position.x - botPos.x, 2) +
          Math.pow(position.y - botPos.y, 2) +
          Math.pow(position.z - botPos.z, 2)
        )
        
        if (dist < 1.0) {
          console.log(`💥 ${id} hit a bot!`)
          bot.takeDamage(15)
          onHit(id)
          return
        }
      }
    }
    
    if (lifespan.current <= 0) {
      console.log(`⏱️ ${id} expired`)
      onHit(id)
    }
  })
  
  const teamColor = team === 'red' ? '#ff0000' : '#0000ff'
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={origin}
      colliders="ball"
      mass={0.1}
      gravityScale={0}
      linearDamping={0}
    >
      <Sphere args={[0.3]}>
        <meshStandardMaterial 
          color={teamColor} 
          emissive={teamColor}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Sphere args={[0.4]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color={teamColor}
          transparent
          opacity={0.3}
        />
      </Sphere>
    </RigidBody>
  )
}