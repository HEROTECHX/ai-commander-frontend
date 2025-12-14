import { Cone, Sphere } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { RapierRigidBody, RigidBody } from "@react-three/rapier"
import { useEffect, useRef, useState } from "react"
import type { AIBotProps } from "../types"
import * as THREE from "three";

export function AIBot({ id, team, startPos, strategy, onTakeDamage, onShoot }: AIBotProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const visionConeRef = useRef<THREE.Mesh>(null)
  const [health, setHealth] = useState(100)
  const [currentAction, setCurrentAction] = useState('idle')
  const attackCooldown = useRef(0)
  const rotationRef = useRef(0)
  const lastShootTime = useRef(0)

  const detectEnemies = () => {
    if (!rigidBodyRef.current) return false
    
    const position = rigidBodyRef.current.translation()
    let enemyDetected = false

    // Check if any enemy bot is within range
    if (window.botRegistry) {
      for (const [botId, bot] of Object.entries(window.botRegistry)) {
        console.log(botId);
        
        if (bot.team === team) continue // Skip teammates
        
        const botPos = bot.rigidBodyRef.current?.translation()
        if (!botPos) continue
        
        // Calculate distance to enemy
        const dist = Math.sqrt(
          Math.pow(position.x - botPos.x, 2) +
          Math.pow(position.y - botPos.y, 2) +
          Math.pow(position.z - botPos.z, 2)
        )
        
        // Enemy within shooting range (15 units)
        if (dist < 15) {
          enemyDetected = true
          
          // Update rotation to face enemy
          const angle = Math.atan2(botPos.x - position.x, botPos.z - position.z)
          rotationRef.current = angle * (180 / Math.PI)
          
          break
        }
      }
    }
    
    return enemyDetected
  }

  const takeDamage = (amount: number) => {
    setHealth(h => {
      const newHealth = Math.max(0, h - amount)
      if (onTakeDamage) {
        onTakeDamage(id, amount)
      }
      return newHealth
    })
  }

  // Expose takeDamage method globally for combat
  useEffect(() => {
    // Store this bot's takeDamage export function in a global registry
    if (typeof window !== 'undefined') {
      if (!window.botRegistry) {
        window.botRegistry = {}
      }
      window.botRegistry[id] = { takeDamage, team, rigidBodyRef }
    }
    
    return () => {
      if (window.botRegistry) {
        delete window.botRegistry[id]
      }
    }
  }, [id, team])

  const shootAtEnemy = (now: number) => {
    if (!rigidBodyRef.current || !onShoot) return false
    if (now - lastShootTime.current < 1.5) return false // 1.5 second cooldown
    
    const position = rigidBodyRef.current.translation()
    const angleRad = rotationRef.current * (Math.PI / 180)
    
    const direction: [number, number, number] = [
      Math.sin(angleRad),
      0,
      Math.cos(angleRad)
    ]
    
    console.log(`🔫 ${id} shooting at direction:`, direction)
    
    onShoot(
      [position.x, position.y + 0.5, position.z],
      direction,
      team
    )
    
    lastShootTime.current = now
    setCurrentAction('shooting')
    return true
  }

  // Simulated "brain" - makes decisions based on vision and strategy
  useFrame((state, delta) => {
    if (!rigidBodyRef.current || health <= 0) return
    
    const velocity = rigidBodyRef.current.linvel()
    
    // AI behavior influenced by strategy
    const now = state.clock.getElapsedTime()
    const baseSpeed = strategy?.aggression ? 2 + strategy.aggression * 3 : 3
    
    let moveX = 0
    let moveZ = 0
    
    // Behavior based on strategy target
    if (strategy?.target === 'enemies') {
      // Aggressive movement toward center
      const decision = Math.floor(now * 0.5) % 4
      switch(decision) {
        case 0:
          moveZ = team === 'red' ? baseSpeed : -baseSpeed
          setCurrentAction('attack_forward')
          break
        case 1:
          moveX = team === 'red' ? baseSpeed : -baseSpeed
          setCurrentAction('attack_flank')
          break
        default:
          moveZ = team === 'red' ? baseSpeed * 0.5 : -baseSpeed * 0.5
          setCurrentAction('attack_advance')
      }
    } else if (strategy?.target === 'base') {
      // Defensive behavior - stay near starting position
      const decision = Math.floor(now * 0.3) % 3
      switch(decision) {
        case 0:
          moveX = Math.sin(now) * baseSpeed * 0.5
          setCurrentAction('defend_patrol')
          break
        case 1:
          moveZ = Math.cos(now) * baseSpeed * 0.5
          setCurrentAction('defend_watch')
          break
        default:
          setCurrentAction('defend_hold')
      }
    } else {
      // Default patrol
      const decision = Math.floor(now * 0.5) % 4
      switch(decision) {
        case 0:
          moveZ = -baseSpeed * 0.7
          setCurrentAction('patrol_forward')
          break
        case 1:
          moveX = baseSpeed * 0.7
          setCurrentAction('patrol_right')
          break
        case 2:
          moveZ = baseSpeed * 0.7
          setCurrentAction('patrol_back')
          break
        case 3:
          moveX = -baseSpeed * 0.7
          setCurrentAction('patrol_left')
          break
      }
    }
    
    // Apply formation modifier
    if (strategy?.formation === 'spread') {
      moveX *= 1.5
      moveZ *= 1.5
    } else if (strategy?.formation === 'line') {
      moveZ *= 0.5
    }
    
    // Apply movement
    rigidBodyRef.current.setLinvel({
      x: moveX,
      y: velocity.y,
      z: moveZ
    }, true)
    
    // Rotate bot to face movement direction
    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(moveX, moveZ)
      rotationRef.current = angle * (180 / Math.PI)
      rigidBodyRef.current.setRotation({ 
        x: 0, 
        y: 0, 
        z: 0, 
        w: Math.cos(angle / 2) 
      }, true)
    }

    // Attack cooldown
    if (attackCooldown.current > 0) {
      attackCooldown.current -= delta
    }

    // Detect and attack enemies
    const enemyInRange = detectEnemies()
    if (enemyInRange && attackCooldown.current <= 0) {
      const didShoot = shootAtEnemy(now)
      if (didShoot) {
        attackCooldown.current = 1.5
        setCurrentAction('attacking')
      }
    }
  })
  
  const teamColor = team === 'red' ? '#ff0000' : '#0000ff'
  
  // Don't render if dead
  if (health <= 0) {
    return null
  }
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={startPos}
      colliders="cuboid"
      mass={1}
      linearDamping={2}
      lockRotations
    >
      {/* Bot Body - Cone shape */}
      <Cone args={[0.5, 1.2, 4]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color={teamColor} metalness={0.3} roughness={0.7} />
      </Cone>
      
      {/* Health Indicator */}
      <Sphere args={[0.15]} position={[0, 1, 0]}>
        <meshBasicMaterial color={health > 50 ? '#00ff00' : '#ff0000'} />
      </Sphere>
      
      {/* Health Bar */}
      <group position={[0, 1.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.8, 0.1]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[-0.4 + (0.4 * health / 100), 0, 0.01]} scale={[health / 100, 1, 1]}>
          <planeGeometry args={[0.8, 0.08]} />
          <meshBasicMaterial color={health > 50 ? '#00ff00' : '#ff0000'} />
        </mesh>
      </group>
      
      {/* Vision Cone Indicator */}
      <mesh ref={visionConeRef} position={[0, 0.3, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.5, 3, 8, 1, true]} />
        <meshBasicMaterial 
          color={teamColor} 
          transparent 
          opacity={0.15} 
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Action indicator */}
      <Sphere args={[0.1]} position={[0, 1.3, 0]}>
        <meshBasicMaterial color={currentAction.includes('attack') || currentAction.includes('shooting') ? '#ff0000' : currentAction.includes('defend') ? '#00ff00' : '#ffff00'} />
      </Sphere>
    </RigidBody>
  )
}
