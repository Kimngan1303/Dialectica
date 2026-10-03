import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float, Stars, Html } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';
import * as THREE from 'three';
import { playGameSfx } from '../../audio/AmbientAudio';

// --- Mô hình 3D: Quy Luật Thống Nhất & Đấu Tranh Giữa Các Mặt Đối Lập ---
const OppositesUnityModel = ({ hovered }) => {
  const groupRef = useRef();
  const sphereRedRef = useRef();
  const sphereGoldRef = useRef();
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const infinityStreamRef = useRef();

  // Tạo quỹ đạo hạt vô cực (Infinity Stream / Lemniscate of Bernoulli)
  const { streamPositions, streamColors } = useMemo(() => {
    const count = 600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorRed = new THREE.Color('#ef4444');
    const colorGold = new THREE.Color('#fbbf24');

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const scale = 3.6;
      // Phương trình hình số 8 / Vô cực
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const x = (scale * Math.cos(t)) / denom;
      const z = (scale * Math.sin(t) * Math.cos(t)) / denom;
      const y = Math.sin(t * 2) * 0.45;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Hòa trộn màu đỏ ở 1 bên, vàng ở 1 bên
      const mixRatio = (Math.sin(t) + 1) / 2;
      const c = colorRed.clone().lerp(colorGold, mixRatio);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return { streamPositions: positions, streamColors: colors };
  }, []);

  // Tạo hạt bao quanh quả cầu Đỏ (Vật chất / Luận đề)
  const redAura = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 350; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.1 + Math.random() * 0.4;
      pts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    return new Float32Array(pts);
  }, []);

  // Tạo hạt bao quanh quả cầu Vàng (Ý thức / Phản đề)
  const goldAura = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 350; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.1 + Math.random() * 0.4;
      pts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    return new Float32Array(pts);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime * (hovered ? 1.8 : 1.0);

    // Xoay toàn bộ hệ thống
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.35;
    }

    // Quả cầu 1: Đỏ (Vật chất) xoay quỹ đạo
    const radius = 2.8;
    const xPos = Math.cos(time * 0.8) * radius;
    const zPos = Math.sin(time * 0.8) * radius;
    const yPos = Math.sin(time * 1.6) * 0.4;

    if (sphereRedRef.current) {
      sphereRedRef.current.position.set(xPos, yPos, zPos);
      sphereRedRef.current.rotation.y += delta * 1.5;
      sphereRedRef.current.rotation.x += delta * 0.8;
    }

    // Quả cầu 2: Vàng (Ý thức) đối diện quả cầu 1
    if (sphereGoldRef.current) {
      sphereGoldRef.current.position.set(-xPos, -yPos, -zPos);
      sphereGoldRef.current.rotation.y -= delta * 1.5;
      sphereGoldRef.current.rotation.z += delta * 0.8;
    }

    // Lõi Biện Chứng ở tâm (Synthesis Core) đập nhịp nhàng
    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.12;
      coreRef.current.scale.set(pulse, pulse, pulse);
      coreRef.current.rotation.x += delta * 0.6;
      coreRef.current.rotation.y += delta * 1.2;
    }

    // Các vòng quỹ đạo năng lượng
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(time * 0.5) * 0.15;
      ring1Ref.current.rotation.z = time * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -Math.PI / 3 + Math.cos(time * 0.5) * 0.15;
      ring2Ref.current.rotation.z = -time * 0.4;
    }

    // Dải hạt vô cực xoay
    if (infinityStreamRef.current) {
      infinityStreamRef.current.rotation.y = -time * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. LÕI HỢP NHẤT BIỆN CHỨNG Ở TRUNG TÂM (DIALECTICAL SYNTHESIS NUCLEUS) */}
      <group ref={coreRef}>
        <mesh>
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#fffbeb"
            emissive="#f59e0b"
            emissiveIntensity={2.5}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.65, 24, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        <pointLight color="#fbbf24" intensity={4} distance={12} />
      </group>

      {/* 2. KHỐI CẦU ĐỎ: VẬT CHẤT (MATTER / THESIS) */}
      <group ref={sphereRedRef}>
        {/* Lõi cầu đặc đỏ ruby */}
        <mesh>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={1.2}
            roughness={0.25}
            metalness={0.8}
          />
        </mesh>
        {/* Khung đa diện wireframe bên ngoài */}
        <mesh>
          <icosahedronGeometry args={[1.25, 1]} />
          <meshStandardMaterial color="#f87171" wireframe emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
        {/* Vầng hào quang hạt đỏ */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={redAura.length / 3} array={redAura} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.06} color="#fca5a5" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </points>
        <pointLight color="#ef4444" intensity={2.5} distance={8} />
      </group>

      {/* 3. KHỐI CẦU VÀNG: Ý THỨC (CONSCIOUSNESS / ANTITHESIS) */}
      <group ref={sphereGoldRef}>
        {/* Lõi cầu đặc vàng hổ phách */}
        <mesh>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#d97706"
            emissiveIntensity={1.2}
            roughness={0.25}
            metalness={0.8}
          />
        </mesh>
        {/* Khung đa diện wireframe bên ngoài */}
        <mesh>
          <icosahedronGeometry args={[1.25, 1]} />
          <meshStandardMaterial color="#fef08a" wireframe emissive="#fbbf24" emissiveIntensity={0.6} />
        </mesh>
        {/* Vầng hào quang hạt vàng */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={goldAura.length / 3} array={goldAura} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.06} color="#fef08a" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </points>
        <pointLight color="#fbbf24" intensity={2.5} distance={8} />
      </group>

      {/* 4. DẢI HẠT NĂNG LƯỢNG VÔ CỰC NỐI LIỀN 2 KHỐI CẦU (INFINITY STREAM) */}
      <points ref={infinityStreamRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={streamPositions.length / 3} array={streamPositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={streamColors.length / 3} array={streamColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* 5. CÁC VÒNG QUỸ ĐẠO BIỆN CHỨNG (DIALECTICAL ORBITAL RINGS) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[3.6, 0.035, 16, 100]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.2, 0.03, 16, 100]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

// --- Màn hình chính Start Scene ---
const BrainModel = () => {
  const groupRef = useRef();
  const viewState = useGameStore((state) => state.viewState);
  const setViewState = useGameStore((state) => state.setViewState);
  const [hovered, setHovered] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  React.useEffect(() => {
    if (viewState === 'START') {
      setIsZooming(false);
      if (groupRef.current) {
        groupRef.current.scale.set(1.4, 1.4, 1.4);
        groupRef.current.position.z = 0;
      }
      if (starsRef.current) {
        starsRef.current.scale.set(1, 1, 1);
        starsRef.current.position.z = 0;
      }
    }
  }, [viewState]);

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    playGameSfx('portal');
    if (e && typeof e.delta === 'number' && e.delta > 5) return; // Drag rotation check

    setIsZooming(true);
    setTimeout(() => {
      setViewState('HUB');
    }, 1200);
  };

  const starsRef = useRef();

  useFrame((state) => {
    if (isZooming) {
      // HIỆU ỨNG NHẢY KHÔNG GIAN BIỆN CHỨNG (Hyperspace Synthesis Jump)
      if (starsRef.current) {
        starsRef.current.scale.lerp(new THREE.Vector3(1, 1, 35), 0.08);
        starsRef.current.position.z += 1.6;
      }
      if (groupRef.current) {
        groupRef.current.scale.lerp(new THREE.Vector3(12, 12, 12), 0.08);
        groupRef.current.position.z += 0.9;
      }
    } else {
      if (starsRef.current) {
        starsRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        starsRef.current.position.z = THREE.MathUtils.lerp(starsRef.current.position.z, 0, 0.1);
      }
      if (groupRef.current) {
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.1);
        const targetScale = hovered ? 1.55 : 1.4;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      }
    }
  });

  if (viewState !== 'START') return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Bầu trời sao và bụi vàng đỏ vũ trụ */}
      <group ref={starsRef}>
        <Stars radius={25} depth={10} count={3500} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={250} scale={12} size={6} speed={0.4} color="#facc15" opacity={0.65} />
        <Sparkles count={200} scale={10} size={8} speed={0.8} color="#ef4444" opacity={0.5} />
      </group>

      <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.25}>
        <group ref={groupRef} position={[0, 0.5, 0]}>
          {/* MÔ HÌNH TRIẾT HỌC: HAI MẶT ĐỐI LẬP THỐNG NHẤT */}
          <OppositesUnityModel hovered={hovered} />

          {/* Hitbox tương tác chuột */}
          <mesh
            visible={false}
            scale={[5, 4, 5]}
            onClick={handleClick}
            onPointerOver={() => {
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = 'default';
            }}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Nhãn Triết Học Trực Quan Dưới Chân Mô Hình */}
          <Html position={[0, -4.2, 0]} center transform distanceFactor={14}>
            <div
              style={{
                textAlign: 'center',
                pointerEvents: 'auto',
                userSelect: 'none',
                width: '420px',
                padding: '16px 24px',
                background: 'rgba(18, 7, 11, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(251, 191, 36, 0.35)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.2)',
                cursor: 'pointer',
              }}
              onClick={handleClick}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #f59e0b, #facc15)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  fontSize: '18px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                QUY LUẬT MÂU THUẪN
              </div>
              <div
                style={{
                  color: '#fef08a',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  marginTop: '4px',
                  fontWeight: '500',
                }}
              >
                Sự Thống Nhất & Đấu Tranh Của Các Mặt Đối Lập
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(e);
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '8px 24px',
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.4), rgba(245,158,11,0.4))',
                  border: '1.5px solid #fbbf24',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#fff',
                  letterSpacing: '1.2px',
                  boxShadow: '0 0 16px rgba(251, 191, 36, 0.6), 0 0 8px rgba(239, 68, 68, 0.5)',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.25s ease',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                ✦ NHẤP VÀO ĐỂ KHAI MỞ HÀNH TRÌNH ✦
              </button>
            </div>
          </Html>
        </group>
      </Float>
    </group>
  );
};

export default BrainModel;
