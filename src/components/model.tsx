import * as THREE from "three";
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { useFBX } from "@react-three/drei";
import { useControls } from "leva";

export function ModelFBX({ url }: { url: string }) {
  const fbx = useFBX(url)
  const mixer = useRef<THREE.AnimationMixer>(null)
  const actionsRef = useRef<THREE.AnimationAction[]>([])
  
  // Get list of animation names for controls
  const animationNames = fbx.animations.map((clip, i) => clip.name || `Animation ${i}`)
  
  const { 
    currentAnimation, 
    timeScale, 
    paused 
  } = useControls({
    currentAnimation: { 
      value: animationNames[0] || 'None', 
      options: animationNames 
    },
    timeScale: { value: 1, min: 0, max: 3, step: 0.1 },
    paused: false
  })
  
  useEffect(() => {
    if (fbx && fbx.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(fbx)
      
      // Create actions for all animations
      actionsRef.current = fbx.animations.map(clip => {
        const action = mixer.current!.clipAction(clip)
        return action
      })
      
      // Play first animation
      actionsRef.current[0]?.play()
    }
  }, [fbx])
  
  // Switch animations when control changes
  useEffect(() => {
    const index = animationNames.indexOf(currentAnimation)
    if (index >= 0 && actionsRef.current[index]) {
      // Stop all animations
      actionsRef.current.forEach(action => action.stop())
      // Play selected animation
      actionsRef.current[index].play()
    }
  }, [currentAnimation, animationNames])
  
  // Update animation
  useFrame((state, delta) => {
    if (mixer.current) {
      if (!paused) {
        mixer.current.update(delta * timeScale)
      }
    }
  })
  
  return <primitive object={fbx} scale={0.01} />
}