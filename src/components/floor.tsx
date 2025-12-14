import { RigidBody } from "@react-three/rapier";

export function Floor() {
  return (
    <RigidBody type="fixed">
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
    </RigidBody>
  )
}


