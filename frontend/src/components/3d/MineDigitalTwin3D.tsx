import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SensorBeaconInstances } from './SensorBeaconInstances';
import { TelemetryParticleSplines } from './TelemetryParticleSplines';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { Eye, Layers, Compass, Video, Sparkles, Navigation } from 'lucide-react';

// Animated Mine Cart traversing railway track
const MineCartTrack: React.FC = () => {
  const cartRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (cartRef.current) {
      const t = (clock.getElapsedTime() * 0.35) % 1;
      const x = -3.8 + t * 7.6;
      const z = Math.sin(t * Math.PI * 2) * 0.3;
      cartRef.current.position.set(x, 0.2, z);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Rails */}
      <mesh position={[0, 0.05, 0.35]}>
        <boxGeometry args={[8, 0.06, 0.06]} />
        <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.05, -0.35]}>
        <boxGeometry args={[8, 0.06, 0.06]} />
        <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.4} />
      </mesh>

      {/* Sleepers / Ties */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} position={[-3.75 + i * 0.5, 0.02, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.9]} />
          <meshStandardMaterial color="#0A2540" />
        </mesh>
      ))}

      {/* Moving Cart */}
      <group ref={cartRef}>
        {/* Cart Tub */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.9, 0.5, 0.6]} />
          <meshStandardMaterial color="#102E4A" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Coal Lumps */}
        <mesh position={[0, 0.55, 0]}>
          <dodecahedronGeometry args={[0.22, 1]} />
          <meshStandardMaterial color="#050C16" roughness={0.9} />
        </mesh>
        {/* Wheels */}
        <mesh position={[-0.3, 0.1, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#00D4FF" />
        </mesh>
        <mesh position={[0.3, 0.1, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#00D4FF" />
        </mesh>
        <mesh position={[-0.3, 0.1, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#00D4FF" />
        </mesh>
        <mesh position={[0.3, 0.1, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#00D4FF" />
        </mesh>
      </group>
    </group>
  );
};

// Underground Mine Structural Geometry
const MineStructure: React.FC<{ showWireframe: boolean }> = ({ showWireframe }) => {
  return (
    <group>
      {/* Central Vertical Mine Shaft (-1500m Depth Wireframe Tube) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 11, 24, 20, true]} />
        <meshStandardMaterial
          color="#00D4FF"
          wireframe={showWireframe}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Shaft Ring Ribs */}
      {Array.from({ length: 11 }).map((_, i) => {
        const y = -5 + i * 1.0;
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.62, 0.03, 16, 32]} />
              <meshBasicMaterial color="#00D4FF" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* Horizontal Branch Tunnel 1 (Tunnel A-04) */}
      <mesh position={[-3.5, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.1, 1.1, 6, 16, 10, true]} />
        <meshStandardMaterial
          color="#2F80ED"
          wireframe={showWireframe}
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Horizontal Branch Tunnel 2 (Gas Zone B-12) */}
      <mesh position={[3.8, -3.2, 0]} rotation={[0, 0.3, Math.PI / 2]}>
        <cylinderGeometry args={[1.2, 1.2, 6.5, 16, 10, true]} />
        <meshStandardMaterial
          color="#FF4D5A"
          wireframe={showWireframe}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Horizontal Branch Tunnel 3 (Conveyor Shaft C-02) */}
      <mesh position={[0, -1.8, 3.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 5.5, 16, 8, true]} />
        <meshStandardMaterial
          color="#8B5CF6"
          wireframe={showWireframe}
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Base Excavation Cavern Dome */}
      <mesh position={[0, -5.5, 0]}>
        <cylinderGeometry args={[2.5, 1.6, 1.2, 24]} />
        <meshStandardMaterial color="#06162B" roughness={0.9} wireframe={showWireframe} />
      </mesh>
    </group>
  );
};

// Dynamic A* Safe Evacuation Route (Reroutes away from contaminated sectors)
const DynamicAStarEscapeRoute3D: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const zonePackets = useTelemetryStore((state) => state.zonePackets);
  const activeZone = useTelemetryStore((state) => state.activeZone);

  // Check if gas zone or face is hazardous
  const isGasHazard = (zonePackets['Gas-Zone-B12']?.methane_CH4 || 0) >= 1.25;
  const isFaceHazard = (zonePackets['Excavation-Face']?.temperature || 0) >= 36;

  // Dynamic Waypoint calculation steering away from contaminated airway
  const escapePath = useMemo(() => {
    if (activeZone === 'Gas-Zone-B12' || isGasHazard) {
      // Diverted safe route: Gas Zone -> Auxiliary Airway Bypass -> Tunnel A Junction -> Main Hoist
      return new THREE.CatmullRomCurve3([
        new THREE.Vector3(4.2, -3.2, -0.8),  // Gas Zone Origin
        new THREE.Vector3(2.2, -1.6, 0.8),   // Safe Detour Airway
        new THREE.Vector3(-1.5, 0.2, 0),     // Tunnel A-04 Safe Crosscut
        new THREE.Vector3(0, 2.5, 0),        // Central Lift
        new THREE.Vector3(0, 5.0, 0),        // Surface Exit
      ]);
    } else if (activeZone === 'Excavation-Face' || isFaceHazard) {
      // Deep Face Detour
      return new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.5, -4.8, 2.2),   // Excavation Face
        new THREE.Vector3(0.8, -2.5, 1.5),   // Chilled Vent Bypass
        new THREE.Vector3(0, 0.5, 0),        // Sub-Shaft Hoist
        new THREE.Vector3(0, 5.0, 0),        // Surface Exit
      ]);
    } else {
      // Standard Nominal Evacuation
      return new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.8, 0.2, 0.5),   // Tunnel A-04
        new THREE.Vector3(-1.5, 0.2, 0),     // Junction
        new THREE.Vector3(0, 2.5, 0),        // Main Shaft
        new THREE.Vector3(0, 5.0, 0),        // Surface Exit
      ]);
    }
  }, [activeZone, isGasHazard, isFaceHazard]);

  const count = 45;
  const particleMeta = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      t: i / count,
      speed: 0.25,
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    particleMeta.forEach((p, i) => {
      p.t = (p.t + delta * p.speed) % 1.0;
      const pt = escapePath.getPoint(p.t);
      dummy.position.copy(pt);
      dummy.scale.set(0.14, 0.14, 0.14);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const pathPoints = escapePath.getPoints(60);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);

  return (
    <group>
      {/* Luminous Neon Green / Amber Dynamic Spline */}
      <primitive
        object={
          new THREE.Line(
            pathGeo,
            new THREE.LineBasicMaterial({
              color: isGasHazard ? '#F59E0B' : '#22C55E',
              linewidth: 3,
              transparent: true,
              opacity: 0.95,
              blending: THREE.AdditiveBlending,
            })
          )
        }
      />

      {/* Moving Directional Chevron Nodes */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={isGasHazard ? '#F59E0B' : '#22C55E'}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
};

// Pulsing Predictive Warning Shader Aura on Accelerating Zones
const PredictiveHazardAura3D: React.FC = () => {
  const predictiveMetrics = useTelemetryStore((state) => state.predictiveMetrics);
  const auraRef = useRef<THREE.Group>(null);

  const zonePositions: Record<string, [number, number, number]> = {
    'Shaft-01': [0, 3.5, 0],
    'Tunnel-A04': [-3.8, 0.2, 0.5],
    'Gas-Zone-B12': [4.2, -3.2, -0.8],
    'Conveyor-C02': [0, -1.8, 3.2],
    'Excavation-Face': [2.5, -4.8, 2.2],
  };

  useFrame(({ clock }) => {
    if (!auraRef.current) return;
    const t = clock.getElapsedTime();
    const scale = 1.0 + Math.sin(t * 4.5) * 0.15;
    auraRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={auraRef}>
      {Object.entries(predictiveMetrics).map(([zone, metric]) => {
        const isImminent = metric.predictiveRiskLevel === 'IMMINENT_BREACH';
        const isElevated = metric.predictiveRiskLevel === 'ELEVATED';
        if (!isImminent && !isElevated) return null;

        const pos = zonePositions[zone] || [0, 0, 0];
        const color = isImminent ? '#FF4D5A' : '#F59E0B';

        return (
          <group key={zone} position={pos}>
            {/* Concentric Spherical Wireframe Aura */}
            <mesh>
              <sphereGeometry args={[0.9, 16, 16]} />
              <meshBasicMaterial
                color={color}
                wireframe
                transparent
                opacity={isImminent ? 0.65 : 0.4}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Glowing Outer Warning Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.95, 1.15, 32]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isImminent ? 0.8 : 0.5}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Ambient Floating Volumetric Dust Particles
const AmbientMineDust: React.FC = () => {
  const count = 180;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      pos: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 11,
        (Math.random() - 0.5) * 12,
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.4,
      seed: Math.random() * 100,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    particles.forEach((p, i) => {
      const y = ((p.pos[1] + time * p.speed + 6) % 12) - 6;
      dummy.position.set(
        p.pos[0] + Math.sin(time * 0.5 + p.seed) * 0.3,
        y,
        p.pos[2] + Math.cos(time * 0.5 + p.seed) * 0.3
      );
      dummy.scale.set(0.04, 0.04, 0.04);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#00D4FF"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};

// Cinematic Smooth Camera Rig
const CameraRig: React.FC<{ preset: string }> = ({ preset }) => {
  const controlsRef = useRef<any>(null);

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;

    let targetPos = new THREE.Vector3(8.5, 3.2, 9.5);
    let lookTarget = new THREE.Vector3(0, -0.5, 0);

    if (preset === 'shaft') {
      targetPos = new THREE.Vector3(2.5, 9.0, 4.5);
      lookTarget = new THREE.Vector3(0, -1.5, 0);
    } else if (preset === 'gasZone') {
      targetPos = new THREE.Vector3(6.5, -2.8, 5.0);
      lookTarget = new THREE.Vector3(3.8, -3.2, 0);
    } else if (preset === 'conveyor') {
      targetPos = new THREE.Vector3(-1.0, -0.8, 7.0);
      lookTarget = new THREE.Vector3(0, -1.8, 3.2);
    }

    // Smooth cinematic interpolation with damping factor 0.04
    camera.position.lerp(targetPos, 0.04);
    controlsRef.current.target.lerp(lookTarget, 0.04);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      minDistance={4}
      maxDistance={22}
      maxPolarAngle={Math.PI / 1.8}
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
};

export const MineDigitalTwin3D: React.FC = () => {
  const [showWireframe, setShowWireframe] = useState(false);
  const cameraPreset = useTelemetryStore((state) => state.cameraPreset);
  const setCameraPreset = useTelemetryStore((state) => state.setCameraPreset);
  const activeZone = useTelemetryStore((state) => state.activeZone);
  const emergencyEvacuationActive = useTelemetryStore((state) => state.emergencyEvacuationActive);
  const overallStatus = useTelemetryStore((state) => state.overallStatus);

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[460px] rounded-xl overflow-hidden border border-cyan-500/30 bg-[#050E1A]/95 shadow-2xl flex flex-col">
      {/* Clean Fixed Top Header with Zero Collisions */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#06111F]/95 border-b border-cyan-500/25 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-hud text-xs font-bold text-white tracking-wider">
            3D MINE DIGITAL TWIN
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
            SECTOR: {activeZone}
          </span>
        </div>

        {/* Camera Navigation Control Pills */}
        <div className="flex items-center gap-1.5 bg-[#0A1A2E]/90 p-1 rounded-lg border border-cyan-500/30 shadow-md">
          <button
            type="button"
            title="Free Orbit Camera"
            onClick={() => setCameraPreset('orbit')}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-tech transition-all ${
              cameraPreset === 'orbit'
                ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/50 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Orbit</span>
          </button>

          <button
            type="button"
            title="Vertical Shaft Focus"
            onClick={() => setCameraPreset('shaft')}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-tech transition-all ${
              cameraPreset === 'shaft'
                ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/50 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Shaft</span>
          </button>

          <button
            type="button"
            title="Gas Zone B-12 Focus"
            onClick={() => setCameraPreset('gasZone')}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-tech transition-all ${
              cameraPreset === 'gasZone'
                ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Gas Zone</span>
          </button>

          <button
            type="button"
            title="Toggle Wireframe Shaders"
            onClick={() => setShowWireframe(!showWireframe)}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-tech transition-all ${
              showWireframe
                ? 'bg-purple-500/30 text-purple-300 font-bold border border-purple-400/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative flex-1 w-full h-full min-h-[340px]">
        <Canvas gl={{ antialias: true, alpha: false }}>
          <color attach="background" args={['#040B16']} />
          <PerspectiveCamera makeDefault position={[8.5, 3.2, 9.5]} fov={48} />
          
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={1.3} color="#00D4FF" />
          <pointLight position={[0, -3, 0]} intensity={2.0} color="#FF4D5A" distance={8} />
          <pointLight position={[-4, 1, 0]} intensity={1.5} color="#22C55E" distance={6} />

          <Stars radius={40} depth={20} count={1200} factor={3} saturation={0.5} fade />

          {/* Subsystems */}
          <MineStructure showWireframe={showWireframe} />
          <MineCartTrack />
          <SensorBeaconInstances />
          <TelemetryParticleSplines />
          <PredictiveHazardAura3D />
          {(emergencyEvacuationActive || overallStatus === 'CRITICAL') && <DynamicAStarEscapeRoute3D />}

          <CameraRig preset={cameraPreset} />
        </Canvas>

        {/* Depth Scale HUD Top-Left Capsule */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 bg-[#06111F]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-cyan-500/30 text-[9px] font-mono shadow-xl z-10">
          <span className="font-hud text-[9px] font-bold text-white border-b border-cyan-500/20 pb-0.5">
            SHAFT ELEVATION
          </span>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>SURFACE (0m)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>-500m (TUNNEL A)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>-1000m (GAS ZONE)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>-1500m (DEEP SHAFT)</span>
          </div>
        </div>

        {/* Bottom HUD - Interaction Hint */}
        <div className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center z-10">
          <span className="text-[10px] font-mono text-cyan-300/80 bg-[#06111F]/90 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/30 shadow-lg">
            CLICK 3D SENSOR BEACONS TO INSPECT LIVE TELEMETRY • DRAG TO ROTATE
          </span>
        </div>
      </div>
    </div>
  );
};
