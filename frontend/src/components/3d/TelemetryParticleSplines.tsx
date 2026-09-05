import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SENSOR_NODES } from './SensorBeaconInstances';

export const TelemetryParticleSplines: React.FC = () => {
  const count = 120;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Hub target at the top surface
  const surfaceHub = useMemo(() => new THREE.Vector3(0, 4.5, 0), []);

  // Build spline curves from each sensor node to the surface hub
  const curves = useMemo(() => {
    return SENSOR_NODES.map((node) => {
      const start = new THREE.Vector3(...node.position);
      const mid = new THREE.Vector3(
        (start.x + surfaceHub.x) * 0.5 + (Math.random() - 0.5) * 1.5,
        (start.y + surfaceHub.y) * 0.5,
        (start.z + surfaceHub.z) * 0.5 + (Math.random() - 0.5) * 1.5
      );
      return new THREE.QuadraticBezierCurve3(start, mid, surfaceHub);
    });
  }, [surfaceHub]);

  // Particle distribution metadata
  const particleMeta = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      curveIndex: Math.floor(Math.random() * curves.length),
      t: Math.random(),
      speed: 0.15 + Math.random() * 0.25,
      size: 0.04 + Math.random() * 0.06,
    }));
  }, [count, curves.length]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    particleMeta.forEach((p, i) => {
      p.t = (p.t + delta * p.speed) % 1.0;
      const point = curves[p.curveIndex].getPoint(p.t);

      dummy.position.copy(point);
      dummy.scale.set(p.size, p.size, p.size);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Visual spline guide lines */}
      {curves.map((curve, idx) => {
        const points = curve.getPoints(24);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive key={idx} object={new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
              color: '#00D4FF',
              transparent: true,
              opacity: 0.2,
              blending: THREE.AdditiveBlending,
            })
          )} />
        );
      })}

      {/* Flowing Data Particle Instances */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color="#00D4FF"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
};
