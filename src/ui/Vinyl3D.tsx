import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'

type Vinyl3DProps = {
  artworkUrl: string | null
  spinning: boolean
}

function useArtworkTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (url === null) {
      setTexture(null)
      return
    }

    let active = true
    const loader = new THREE.TextureLoader()

    loader.load(url, (loaded) => {
      if (!active) {
        return
      }
      loaded.colorSpace = THREE.SRGBColorSpace
      loaded.anisotropy = 4
      setTexture(loaded)
    })

    return () => {
      active = false
    }
  }, [url])

  return texture
}

function createGrooveTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  if (context !== null) {
    const center = size / 2
    for (let radius = size * 0.28; radius < size * 0.5; radius += 2.5) {
      context.strokeStyle = `rgba(0, 0, 0, ${0.05 + (Math.floor(radius) % 3) * 0.02})`
      context.lineWidth = 1
      context.beginPath()
      context.arc(center, center, radius, 0, Math.PI * 2)
      context.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function GrooveRings() {
  const texture = useMemo(() => createGrooveTexture(), [])

  return (
    <mesh position={[0, 0, 0.0325]}>
      <circleGeometry args={[0.995, 128]} />
      <meshBasicMaterial depthWrite={false} map={texture} opacity={0.9} transparent />
    </mesh>
  )
}

function SpinningDisc({ texture, spinning }: { texture: THREE.Texture | null; spinning: boolean }) {
  const group = useRef<THREE.Group>(null)
  const speed = useRef(0)

  useFrame((_, delta) => {
    if (group.current === null) {
      return
    }

    const target = spinning ? 1.2 : 0
    speed.current = THREE.MathUtils.damp(speed.current, target, 1.4, delta)
    group.current.rotation.z -= speed.current * delta
  })

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.055, 128]} />
        <meshPhysicalMaterial
          clearcoat={0.9}
          clearcoatRoughness={0.28}
          color="#15141a"
          metalness={0.4}
          roughness={0.32}
        />
      </mesh>

      {texture !== null ? (
        <mesh position={[0, 0, 0.032]}>
          <circleGeometry args={[0.64, 96]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ) : (
        <mesh position={[0, 0, 0.032]}>
          <circleGeometry args={[0.36, 96]} />
          <meshStandardMaterial color="#f3ece3" metalness={0.1} roughness={0.6} />
        </mesh>
      )}

      <GrooveRings />

      <mesh position={[0, 0, 0.035]}>
        <circleGeometry args={[0.032, 48]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.4} />
      </mesh>
    </group>
  )
}

function Tonearm({ playing }: { playing: boolean }) {
  const arm = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (arm.current === null) {
      return
    }

    const target = playing ? -0.5 : -1.05
    arm.current.rotation.z = THREE.MathUtils.damp(arm.current.rotation.z, target, 3, delta)
  })

  return (
    <group position={[1.05, 0.62, 0.42]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.13, 32]} />
        <meshStandardMaterial color="#cfcac3" metalness={0.85} roughness={0.3} />
      </mesh>
      <group ref={arm} rotation={[0, 0, -1.05]}>
        <mesh position={[0, -0.52, 0]}>
          <boxGeometry args={[0.065, 1, 0.05]} />
          <meshStandardMaterial color="#ded9d2" metalness={0.9} roughness={0.24} />
        </mesh>
        <mesh position={[0, -1.06, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.08]} />
          <meshStandardMaterial color="#26242a" metalness={0.45} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function Tilt({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (group.current === null) {
      return
    }

    const targetX = -0.24 + state.pointer.y * 0.05
    const targetY = state.pointer.x * 0.12
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, delta)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4, delta)
  })

  return <group ref={group}>{children}</group>
}

export default function Vinyl3D({ artworkUrl, spinning }: Vinyl3DProps) {
  const texture = useArtworkTexture(artworkUrl)

  return (
    <Canvas
      camera={{ position: [0, 0, 3.15], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight intensity={1.7} position={[3, 4, 5]} />
      <directionalLight color="#ffe8d6" intensity={0.55} position={[-4, -2, 3]} />

      <Tilt>
        <SpinningDisc spinning={spinning} texture={texture} />
        <Tonearm playing={spinning} />
      </Tilt>
    </Canvas>
  )
}
