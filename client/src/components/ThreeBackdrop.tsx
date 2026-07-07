import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import type { Group } from "three";

function ScrollScene({ scrollProgress }: { scrollProgress: number }) {
  const rootRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);
  const orbRef = useRef<Group>(null);

  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4.8,
          -Math.random() * 6 - 0.8
        ] as [number, number, number],
        scale: Math.random() * 0.04 + 0.01
      })),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = Math.min(1, Math.max(0, scrollProgress));

    if (rootRef.current) {
      rootRef.current.rotation.y = t * 0.08 + p * 0.7;
      rootRef.current.rotation.x = Math.sin(t * 0.2) * 0.06 + p * 0.28;
      rootRef.current.position.y = -p * 0.45;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.35;
      ringRef.current.rotation.x = 0.85 + p * 0.5;
      ringRef.current.position.x = 1.15 - p * 0.9;
    }

    if (orbRef.current) {
      orbRef.current.rotation.y -= delta * 0.5;
      orbRef.current.position.x = -1.3 + p * 1.4;
      orbRef.current.position.y = 0.45 - p * 0.3;
    }
  });

  return (
    <group ref={rootRef}>
      <mesh ref={ringRef} position={[1.15, 0.05, -1.2]}>
        <torusKnotGeometry args={[0.52, 0.14, 180, 24, 2, 5]} />
        <meshStandardMaterial color="#d3a45f" metalness={0.72} roughness={0.16} />
      </mesh>

      <mesh ref={orbRef} position={[-1.3, 0.45, -0.9]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#8c6b48" metalness={0.45} roughness={0.2} />
      </mesh>

      <mesh position={[0.2, -0.55, -1.8]} rotation={[0.8, 0.4, 0]}>
        <torusGeometry args={[0.8, 0.045, 24, 140]} />
        <meshStandardMaterial color="#f0d3a1" metalness={0.5} roughness={0.25} />
      </mesh>

      {stars.map((item, idx) => (
        <mesh key={`star-${idx}`} position={item.position}>
          <sphereGeometry args={[item.scale, 8, 8]} />
          <meshBasicMaterial color="#f4d9ab" transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
}

export default function ThreeBackdrop({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <div className="three-wrap" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.1, 4.9], fov: 42 }}>
        <ambientLight intensity={0.58} />
        <directionalLight position={[2, 4, 3]} intensity={1.05} />
        <pointLight position={[-2, 1.2, 1.5]} intensity={0.8} color="#f3d6a0" />
        <ScrollScene scrollProgress={scrollProgress} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
