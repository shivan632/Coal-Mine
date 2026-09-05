import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MineZoneId, SafetyStatus } from '../../types/dashboard';
import { useTelemetryStore } from '../../stores/useTelemetryStore';

interface SensorNodeData {
  id: string;
  zone: MineZoneId;
  label: string;
  depth: number;
  position: [number, number, number];
}

export const SENSOR_NODES: SensorNodeData[] = [
  { id: 'NODE-SHAFT-01', zone: 'Shaft-01', label: 'Shaft Entry #1', depth: 300, position: [0, 3.5, 0] },
  { id: 'NODE-A04', zone: 'Tunnel-A04', label: 'Tunnel A-04', depth: 750, position: [-3.8, 0.2, 0.5] },
  { id: 'NODE-B12', zone: 'Gas-Zone-B12', label: 'Gas Zone B-12', depth: 1200, position: [4.2, -3.2, -0.8] },
  { id: 'NODE-C02', zone: 'Conveyor-C02', label: 'Conveyor Shaft C-02', depth: 920, position: [0, -1.8, 3.2] },
  { id: 'NODE-EXCAV', zone: 'Excavation-Face', label: 'Excavation Face', depth: 1450, position: [2.5, -4.8, 2.2] },
];

const STATUS_COLOR_MAP: Record<SafetyStatus, THREE.Color> = {
  NOMINAL: new THREE.Color('#22C55E'),
  WARNING: new THREE.Color('#F59E0B'),
  CRITICAL: new THREE.Color('#FF4D5A'),
};

export const SensorBeaconInstances: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const zonePackets = useTelemetryStore((state) => state.zonePackets);
  const activeZone = useTelemetryStore((state) => state.activeZone);
  const setActiveZone = useTelemetryStore((state) => state.setActiveZone);
  const setSelected3DNode = useTelemetryStore((state) => state.setSelected3DNode);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    SENSOR_NODES.forEach((node, i) => {
      const packet = zonePackets[node.zone];
      const isSelected = activeZone === node.zone;
      const speed = packet?.status === 'CRITICAL' ? 6 : packet?.status === 'WARNING' ? 4 : 2;
      const pulse = (isSelected ? 1.3 : 1.0) + Math.sin(time * speed + i) * 0.15;

      dummy.position.set(...node.position);
      dummy.scale.set(pulse, pulse, pulse);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      const statusColor = STATUS_COLOR_MAP[packet?.status || 'NOMINAL'];
      meshRef.current.setColorAt(i, statusColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, SENSOR_NODES.length]}
        onClick={(e) => {
          e.stopPropagation();
          const instanceId = e.instanceId;
          if (instanceId !== undefined && SENSOR_NODES[instanceId]) {
            const node = SENSOR_NODES[instanceId];
            setActiveZone(node.zone);
            setSelected3DNode(node.id);
          }
        }}
      >
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Holographic Fixed-Pixel Labels for Each Node */}
      {SENSOR_NODES.map((node) => {
        const packet = zonePackets[node.zone];
        const isSelected = activeZone === node.zone;
        const status = packet?.status || 'NOMINAL';

        return (
          <group key={node.id} position={node.position}>
            {/* Outer Pulsing Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.35, 0.45, 32]} />
              <meshBasicMaterial
                color={STATUS_COLOR_MAP[status]}
                transparent
                opacity={isSelected ? 0.9 : 0.4}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Screen-Projected Constant-Pixel Badge (No explosive scaling!) */}
            <Html
              position={[0, 0.4, 0]}
              center
              zIndexRange={[1, 5]}
              className="pointer-events-none select-none"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveZone(node.zone);
                  setSelected3DNode(node.id);
                }}
                className={`cursor-pointer pointer-events-auto flex flex-col items-center px-2 py-1 rounded-lg border backdrop-blur-md transition-all duration-200 shadow-lg select-none whitespace-nowrap ${
                  isSelected
                    ? 'border-cyan-400 bg-[#061424]/95 ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.6)] scale-105'
                    : 'border-slate-800 bg-[#06111F]/90 hover:border-cyan-500/60 hover:bg-[#0A1A2E]/95 opacity-85 hover:opacity-100 hover:scale-105'
                }`}
                style={{ maxWidth: '140px' }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      status === 'NOMINAL'
                        ? 'bg-emerald-400 shadow-[0_0_6px_#22C55E]'
                        : status === 'WARNING'
                        ? 'bg-amber-400 shadow-[0_0_6px_#F59E0B]'
                        : 'bg-rose-400 shadow-[0_0_8px_#FF4D5A] animate-ping'
                    }`}
                  />
                  <span className="text-[10px] font-hud font-bold text-white tracking-wide">
                    {node.label}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-cyan-300 flex items-center gap-2 mt-0.5">
                  <span>CH₄: <strong>{packet?.methane_CH4 ?? 0.5}%</strong></span>
                  <span className="text-slate-400">•</span>
                  <span>{packet?.temperature ?? 24}°C</span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
