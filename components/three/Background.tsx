"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Icosahedron } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function ParticleField({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocityRef = useRef<Float32Array>(new Float32Array(count * 3));
  const mouse = useRef(new THREE.Vector2(999, 999));
  const { viewport } = useThree();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
      velocityRef.current[i * 3] = (Math.random() - 0.5) * 0.002;
      velocityRef.current[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      velocityRef.current[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    return arr;
  }, [count]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const pos = geometry.attributes.position.array as Float32Array;
    const elapsed = clock.getElapsedTime();
    const scrollFactor = Math.min(1.4, 1 + (window.scrollY || 0) / 3000);

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      pos[ix] += velocityRef.current[ix] * scrollFactor;
      pos[iy] += velocityRef.current[iy] * scrollFactor;
      pos[iz] += velocityRef.current[iz] * scrollFactor;

      const px = pos[ix] / (viewport.width * 0.5);
      const py = pos[iy] / (viewport.height * 0.5);
      const dx = px - mouse.current.x;
      const dy = py - mouse.current.y;
      const distance = dx * dx + dy * dy;

      if (distance < 0.35) {
        const repel = (0.35 - distance) * 0.01;
        pos[ix] += dx * repel;
        pos[iy] += dy * repel;
      }

      if (Math.abs(pos[ix]) > 10) pos[ix] *= -0.98;
      if (Math.abs(pos[iy]) > 9) pos[iy] *= -0.98;
      if (Math.abs(pos[iz]) > 8) pos[iz] *= -0.98;

      pos[iy] += Math.sin(elapsed + i * 0.01) * 0.00035;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a78bfa" transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

function RotatingShapes() {
  const shapeOne = useRef<THREE.Mesh>(null);
  const shapeTwo = useRef<THREE.Mesh>(null);
  const shapeThree = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (shapeOne.current) {
      shapeOne.current.rotation.x = t * 0.1;
      shapeOne.current.rotation.y = t * 0.12;
    }
    if (shapeTwo.current) {
      shapeTwo.current.rotation.x = -t * 0.08;
      shapeTwo.current.rotation.z = t * 0.12;
    }
    if (shapeThree.current) {
      shapeThree.current.rotation.y = t * 0.06;
      shapeThree.current.rotation.z = -t * 0.1;
    }
  });

  return (
    <>
      <Icosahedron ref={shapeOne} args={[1.1, 0]} position={[5, 3, -5]}>
        <meshBasicMaterial wireframe color="#a855f7" transparent opacity={0.25} />
      </Icosahedron>
      <Icosahedron ref={shapeTwo} args={[0.9, 0]} position={[-5, -2, -4]}>
        <meshBasicMaterial wireframe color="#818cf8" transparent opacity={0.25} />
      </Icosahedron>
      <Icosahedron ref={shapeThree} args={[0.7, 0]} position={[0, 4, -6]}>
        <meshBasicMaterial wireframe color="#ec4899" transparent opacity={0.2} />
      </Icosahedron>
    </>
  );
}

function GradientBlob({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.3 + position[0]) * 0.8;
    ref.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[2.8, 36, 36]} />
      <meshBasicMaterial color={color} transparent opacity={0.07} />
    </mesh>
  );
}

export default function Background() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={mobile ? [1, 1.25] : [1, 2]}>
        <color attach="background" args={["#0d0a1a"]} />
        <ParticleField count={mobile ? 400 : 1600} />
        <RotatingShapes />
        <GradientBlob position={[-3, 0, -7]} color="#7e22ce" />
        <GradientBlob position={[4, -2, -8]} color="#4338ca" />
        <GradientBlob position={[0, 3, -9]} color="#ec4899" />
        {!mobile && (
          <EffectComposer>
            <Bloom intensity={0.45} luminanceThreshold={0.02} luminanceSmoothing={0.8} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
