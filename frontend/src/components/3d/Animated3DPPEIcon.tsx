import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export type PPEType = 'helmet' | 'jacket' | 'mask' | 'boots' | 'gloves';

interface Animated3DPPEIconProps {
  type: PPEType;
  isActive: boolean;
  size?: number;
  className?: string;
  isHovered?: boolean;
}

// 3D Geometry Models for PPE items
const HelmetModel: React.FC<{ isActive: boolean; isHovered: boolean }> = ({ isActive, isHovered }) => {
  const groupRef = useRef<THREE.Group>(null);
  const primaryColor = isActive ? '#00D4FF' : '#FF4D5A';
  const lampColor = isActive ? '#22C55E' : '#FF4D5A';

  useFrame((state) => {
    if (groupRef.current) {
      const speed = isHovered ? 2.5 : 1;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.8 * speed;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 1.2) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Helmet Dome */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial
          color={primaryColor}
          roughness={0.2}
          metalness={0.8}
          emissive={primaryColor}
          emissiveIntensity={isActive ? 0.35 : 0.6}
        />
      </mesh>

      {/* Brim Rim */}
      <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.08, 0.1, 16, 32]} />
        <meshStandardMaterial color="#0A1A2E" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Visor Extension */}
      <mesh position={[0, 0.35, 0.7]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.5]} />
        <meshStandardMaterial color={primaryColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Headlamp */}
      <mesh position={[0, 0.75, 0.95]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.25, 16]} />
        <meshStandardMaterial color="#0A1A2E" metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.75, 1.08]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 16]} />
        <meshBasicMaterial color={lampColor} />
      </mesh>
    </group>
  );
};

const JacketModel: React.FC<{ isActive: boolean; isHovered: boolean }> = ({ isActive, isHovered }) => {
  const groupRef = useRef<THREE.Group>(null);
  const vestColor = isActive ? '#00E5FF' : '#FF4D5A';
  const stripeColor = isActive ? '#22C55E' : '#991B1B';

  useFrame((state) => {
    if (groupRef.current) {
      const speed = isHovered ? 2.5 : 1;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.8 * speed;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Torso Vest */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 1.6, 0.7]} />
        <meshStandardMaterial
          color={vestColor}
          roughness={0.3}
          metalness={0.6}
          emissive={vestColor}
          emissiveIntensity={isActive ? 0.3 : 0.6}
        />
      </mesh>

      {/* Reflective Stripes */}
      <mesh position={[0, 0.2, 0.37]}>
        <boxGeometry args={[1.42, 0.2, 0.02]} />
        <meshStandardMaterial color={stripeColor} emissive={stripeColor} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, -0.3, 0.37]}>
        <boxGeometry args={[1.42, 0.2, 0.02]} />
        <meshStandardMaterial color={stripeColor} emissive={stripeColor} emissiveIntensity={0.8} />
      </mesh>
      {/* Vertical suspender stripes */}
      <mesh position={[-0.4, 0.4, 0.37]}>
        <boxGeometry args={[0.18, 0.8, 0.02]} />
        <meshStandardMaterial color={stripeColor} emissive={stripeColor} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.4, 0.4, 0.37]}>
        <boxGeometry args={[0.18, 0.8, 0.02]} />
        <meshStandardMaterial color={stripeColor} emissive={stripeColor} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};

const MaskModel: React.FC<{ isActive: boolean; isHovered: boolean }> = ({ isActive, isHovered }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyColor = isActive ? '#0A2540' : '#450A0A';
  const filterColor = isActive ? '#00D4FF' : '#FF4D5A';

  useFrame((state) => {
    if (groupRef.current) {
      const speed = isHovered ? 2.5 : 1;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.8 * speed;
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Center Snout Core */}
      <mesh position={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.5, 0.7, 0.9, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Dual Gas Cartridge Filters */}
      <mesh position={[-0.8, -0.1, 0]} rotation={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.5, 16]} />
        <meshStandardMaterial
          color={filterColor}
          emissive={filterColor}
          emissiveIntensity={isActive ? 0.4 : 0.7}
          metalness={0.8}
        />
      </mesh>
      <mesh position={[0.8, -0.1, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.5, 16]} />
        <meshStandardMaterial
          color={filterColor}
          emissive={filterColor}
          emissiveIntensity={isActive ? 0.4 : 0.7}
          metalness={0.8}
        />
      </mesh>

      {/* Exhalation Valve */}
      <mesh position={[0, -0.2, 0.65]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={isActive ? 0.5 : 0.1} />
      </mesh>
    </group>
  );
};

const BootsModel: React.FC<{ isActive: boolean; isHovered: boolean }> = ({ isActive, isHovered }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bootColor = isActive ? '#0E2439' : '#330808';
  const capColor = isActive ? '#00D4FF' : '#FF4D5A';

  useFrame((state) => {
    if (groupRef.current) {
      const speed = isHovered ? 2.5 : 1;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.8 * speed;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Left Boot */}
      <group position={[-0.45, 0, 0]}>
        {/* Shaft */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.9, 16]} />
          <meshStandardMaterial color={bootColor} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Foot Base */}
        <mesh position={[0, -0.15, 0.25]}>
          <boxGeometry args={[0.65, 0.35, 1.1]} />
          <meshStandardMaterial color={bootColor} roughness={0.5} />
        </mesh>
        {/* Steel Toe Cap */}
        <mesh position={[0, -0.1, 0.7]}>
          <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={capColor} emissive={capColor} emissiveIntensity={isActive ? 0.4 : 0.7} metalness={0.9} />
        </mesh>
      </group>

      {/* Right Boot */}
      <group position={[0.45, 0, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.9, 16]} />
          <meshStandardMaterial color={bootColor} roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.15, 0.25]}>
          <boxGeometry args={[0.65, 0.35, 1.1]} />
          <meshStandardMaterial color={bootColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.1, 0.7]}>
          <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={capColor} emissive={capColor} emissiveIntensity={isActive ? 0.4 : 0.7} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

const GlovesModel: React.FC<{ isActive: boolean; isHovered: boolean }> = ({ isActive, isHovered }) => {
  const groupRef = useRef<THREE.Group>(null);
  const gloveColor = isActive ? '#0C2A4A' : '#450A0A';
  const gripColor = isActive ? '#00D4FF' : '#FF4D5A';

  useFrame((state) => {
    if (groupRef.current) {
      const speed = isHovered ? 2.5 : 1;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.8 * speed;
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Palm Hand */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 1.2, 0.35]} />
        <meshStandardMaterial color={gloveColor} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Reinforced Knuckle Guard */}
      <mesh position={[0, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.9, 12]} />
        <meshStandardMaterial color={gripColor} emissive={gripColor} emissiveIntensity={isActive ? 0.5 : 0.8} />
      </mesh>
      {/* Gauntlet Cuff */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.5, 16]} />
        <meshStandardMaterial color="#0A1A2E" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

export const Animated3DPPEIcon: React.FC<Animated3DPPEIconProps> = ({
  type,
  isActive,
  size = 72,
  className = '',
  isHovered = false,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#00D4FF" />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#8B5CF6" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          {type === 'helmet' && <HelmetModel isActive={isActive} isHovered={isHovered} />}
          {type === 'jacket' && <JacketModel isActive={isActive} isHovered={isHovered} />}
          {type === 'mask' && <MaskModel isActive={isActive} isHovered={isHovered} />}
          {type === 'boots' && <BootsModel isActive={isActive} isHovered={isHovered} />}
          {type === 'gloves' && <GlovesModel isActive={isActive} isHovered={isHovered} />}
        </Float>
      </Canvas>
    </div>
  );
};
