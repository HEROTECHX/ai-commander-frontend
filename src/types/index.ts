import { RapierRigidBody } from "@react-three/rapier"

// Type definitions for bot registry
export interface BotRegistryEntry {
  takeDamage: (amount: number) => void
  team: 'red' | 'blue'
  rigidBodyRef: React.RefObject<RapierRigidBody | null>
}

export interface BotRegistry {
  [key: string]: BotRegistryEntry
}

// Extend Window interface - DECLARE THIS ONLY ONCE
declare global {
  interface Window {
    botRegistry?: BotRegistry
  }
}

export interface Strategy {
  formation: string
  target: string
  aggression: number
}

export interface AIBotProps {
  id: string
  team: 'red' | 'blue'
  startPos: [number, number, number]
  strategy: Strategy | null
  onTakeDamage?: (id: string, amount: number) => void
  onShoot?: (origin: [number, number, number], direction: [number, number, number], team: 'red' | 'blue') => void
}

export interface ProjectileProps {
  id: string
  origin: [number, number, number]
  direction: [number, number, number]
  team: 'red' | 'blue'
  onHit: (id: string) => void
}

export interface Strategy {
  formation: string
  target: string
  aggression: number
}
