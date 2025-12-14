import { useFrame } from "@react-three/fiber"
import { RapierRigidBody, RigidBody } from "@react-three/rapier"
import { useEffect, useRef } from "react"

export function Character() {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  useFrame(() => {
    if (!rigidBodyRef.current) return
    
    const keys = keysPressed.current
    const velocity = rigidBodyRef.current.linvel()
    
    const speed = 5
    let moveX = 0
    let moveZ = 0
    
    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= speed
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += speed
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= speed
    if (keys['KeyD'] || keys['ArrowRight']) moveX += speed
    
    rigidBodyRef.current.setLinvel({
      x: moveX,
      y: velocity.y,
      z: moveZ
    }, true)
    
    if (keys['Space'] && Math.abs(velocity.y) < 0.5) {
      rigidBodyRef.current.applyImpulse({ x: 0, y: 5, z: 0 }, true)
    }
  })
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[0, 2, 0]}
      colliders="cuboid"
      mass={1}
      linearDamping={0.5}
      lockRotations
    >
      <mesh castShadow>
        <boxGeometry args={[0.8, 1.6, 0.8]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </RigidBody>
  )
}
