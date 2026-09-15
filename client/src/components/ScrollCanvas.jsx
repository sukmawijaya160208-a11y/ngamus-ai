import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function FloatingTorus({ position, color, speed = 1, size = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
    }
  });

  return (
    <Float speed={1.2 * speed} rotationIntensity={0.8} floatIntensity={1.5}>
      <Torus ref={meshRef} args={[1, 0.3, 32, 64]} scale={size}>
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={1}
        />
      </Torus>
    </Float>
  );
}

function FloatingBox({ position, color, speed = 1, size = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.15 * speed;
    }
  });

  return (
    <Float speed={1 * speed} rotationIntensity={0.6} floatIntensity={2}>
      <RoundedBox ref={meshRef} args={[1, 1, 1]} radius={0.1} smoothness={4} scale={size}>
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
        />
      </RoundedBox>
    </Float>
  );
}

export default function ScrollCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#d97706" />

        <FloatingTorus
          position={[-4, 2, -2]}
          color="#d97706"
          speed={0.7}
          size={0.8}
        />
        <FloatingBox
          position={[4, -1, -3]}
          color="#b45309"
          speed={1.1}
          size={0.6}
        />
        <FloatingTorus
          position={[2, 3, -4]}
          color="#92400e"
          speed={0.5}
          size={1.2}
        />
        <FloatingBox
          position={[-2, -2, -2]}
          color="#d97706"
          speed={0.9}
          size={0.5}
        />
      </Canvas>
    </div>
  );
}
