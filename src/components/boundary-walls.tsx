import { RigidBody } from "@react-three/rapier"

export function BoundaryWalls() {
  const wallHeight = 5
  const wallThickness = 1
  const arenaSize = 20
  
  return (
    <>
      <RigidBody type="fixed" position={[0, wallHeight / 2, -arenaSize]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[arenaSize * 2 + wallThickness * 2, wallHeight, wallThickness]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </RigidBody>
      
      <RigidBody type="fixed" position={[0, wallHeight / 2, arenaSize]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[arenaSize * 2 + wallThickness * 2, wallHeight, wallThickness]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </RigidBody>
      
      <RigidBody type="fixed" position={[arenaSize, wallHeight / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[wallThickness, wallHeight, arenaSize * 2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </RigidBody>
      
      <RigidBody type="fixed" position={[-arenaSize, wallHeight / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[wallThickness, wallHeight, arenaSize * 2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </RigidBody>
    </>
  )
}