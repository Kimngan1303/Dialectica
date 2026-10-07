import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { playGameSfx } from '../../audio/AmbientAudio';

// ==========================================
// 1. BIỂU TƯỢNG NHÁNH 1: KHỐI PHA LÊ BẢN THỂ (VẬT CHẤT & Ý THỨC)
// ==========================================
const Branch1Visual = ({ isUnlocked }) => {
  const crystalRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.8;
      crystalRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.5;
      ringRef.current.rotation.z += delta * 0.7;
    }
  });

  return (
    <group>
      {/* Khối Tinh Thể Đa Diện Ruby (Bản Thể Khách Quan) */}
      <mesh ref={crystalRef} scale={[1.8, 2.6, 1.8]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#b91c1c"
          emissiveIntensity={isUnlocked ? 1.8 : 0.6}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>
      {/* Khung đa diện lơ lửng */}
      <mesh scale={[2.2, 3.0, 2.2]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#fca5a5" wireframe emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      {/* Vòng đai quỹ đạo nguyên tử */}
      <mesh ref={ringRef}>
        <torusGeometry args={[3.2, 0.05, 16, 64]} />
        <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
      <pointLight color="#ef4444" intensity={isUnlocked ? 3 : 1} distance={10} />
    </group>
  );
};

// ==========================================
// 2. BIỂU TƯỢNG NHÁNH 2: VÒNG XOAY BIỆN CHỨNG (MÂU THUẪN & LƯỢNG - CHẤT)
// ==========================================
const Branch2Visual = ({ isUnlocked }) => {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const coreRef = useRef();

  useFrame((state, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 1.2;
      ring1Ref.current.rotation.y += delta * 0.8;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 1.4;
      ring2Ref.current.rotation.z += delta * 0.9;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      coreRef.current.scale.set(pulse, pulse, pulse);
      coreRef.current.rotation.z -= delta * 0.5;
    }
  });

  return (
    <group>
      {/* Lõi Năng Lượng Biến Dịch ở tâm */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#ea580c"
          emissiveIntensity={isUnlocked ? 2.2 : 0.7}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      {/* 2 Vành đai xoay lồng nhau đối xứng - Biểu trưng cho sự thống nhất và đấu tranh */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.5, 0.12, 16, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={isUnlocked ? 1.5 : 0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.2, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#c2410c"
          emissiveIntensity={isUnlocked ? 1.5 : 0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <pointLight color="#f97316" intensity={isUnlocked ? 3.5 : 1} distance={10} />
    </group>
  );
};

// ==========================================
// 3. BIỂU TƯỢNG NHÁNH 3: THÁP CHÂN LÝ & THỰC TIỄN (LÝ LUẬN NHẬN THỨC)
// ==========================================
const Branch3Visual = ({ isUnlocked }) => {
  const beaconRef = useRef();
  const crownRef = useRef();

  useFrame((state, delta) => {
    if (beaconRef.current) {
      beaconRef.current.rotation.y += delta * 0.6;
    }
    if (crownRef.current) {
      crownRef.current.rotation.y -= delta * 1.0;
      crownRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group>
      {/* Ngọn Tháp Lục Giác Soi Sáng Chân Lý */}
      <group ref={beaconRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 1.4, 3.5, 6]} />
          <meshStandardMaterial
            color="#eab308"
            emissive="#ca8a04"
            emissiveIntensity={isUnlocked ? 2.0 : 0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <dodecahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#eab308"
            emissiveIntensity={isUnlocked ? 2.8 : 0.8}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Vành Vương Miện Tri Thức Lơ Lửng */}
      <group ref={crownRef}>
        <mesh>
          <torusGeometry args={[2.6, 0.08, 16, 64]} />
          <meshStandardMaterial color="#fde047" emissive="#eab308" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Cột Ánh Sáng Thẳng Đứng */}
      {isUnlocked && (
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.1, 0.6, 10, 16]} />
          <meshBasicMaterial color="#fef08a" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      <pointLight color="#eab308" intensity={isUnlocked ? 4 : 1} distance={12} />
    </group>
  );
};

// ==========================================
// 4. BIỂU TƯỢNG NHÁNH 4: BÁNH XE LỊCH SỬ TỐI THƯỢNG (DUY VẬT LỊCH SỬ / BOSS)
// ==========================================
const BossVisual = ({ isUnlocked }) => {
  const gearRef = useRef();
  const starRef = useRef();

  useFrame((state, delta) => {
    if (gearRef.current) {
      gearRef.current.rotation.z += delta * 0.4;
      gearRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (starRef.current) {
      starRef.current.rotation.z -= delta * 0.7;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.1;
      starRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      {/* Bánh Răng Lịch Sử Hoàng Gia 3D */}
      <group ref={gearRef}>
        {/* Vành Bánh Răng */}
        <mesh>
          <torusGeometry args={[2.8, 0.35, 16, 32]} />
          <meshStandardMaterial
            color="#fffbeb"
            emissive="#f59e0b"
            emissiveIntensity={isUnlocked ? 1.8 : 0.5}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {/* Các Răng Cưa Xung Quanh (8 nan răng) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 3.1, Math.sin(angle) * 3.1, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[0.5, 0.7, 0.6]} />
              <meshStandardMaterial
                color="#facc15"
                emissive="#d97706"
                emissiveIntensity={isUnlocked ? 2.0 : 0.6}
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>

      {/* Lõi Ngôi Sao Chân Lý 8 Cánh ở Trung Tâm */}
      <group ref={starRef}>
        <mesh>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#fde047"
            emissiveIntensity={isUnlocked ? 3.0 : 0.9}
            roughness={0.05}
            metalness={0.95}
          />
        </mesh>
      </group>

      <pointLight color="#fffbeb" intensity={isUnlocked ? 5 : 1.5} distance={15} />
    </group>
  );
};

// ==========================================
// VÒNG NĂNG LƯỢNG GALAXY NỀN
// ==========================================
const PortalGalaxy = ({ color, isUnlocked }) => {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = [];
    const col = [];
    const colorObj = new THREE.Color(color);

    for (let i = 0; i < 1200; i++) {
      const radius = Math.random() * 3.5 + 1.2;
      const angle = Math.random() * Math.PI * 2;

      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 1.0;
      const z = Math.sin(angle) * radius;
      pos.push(x, y, z);

      const c = colorObj.clone();
      c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.4);
      col.push(c.r, c.g, c.b);
    }
    return [new Float32Array(pos), new Float32Array(col)];
  }, [color]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= isUnlocked ? delta * 0.4 : delta * 0.1;
      pointsRef.current.rotation.z -= isUnlocked ? delta * 0.15 : delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef} rotation={[Math.PI / 4, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={isUnlocked ? 0.75 : 0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ==========================================
// DÂY XÍCH & Ổ KHÓA CỔNG
// ==========================================
const LockAndChains = ({ isShattering }) => {
  const groupRef = useRef();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isShattering) {
      const p = [];
      for (let i = 0; i < 50; i++) {
        p.push({
          pos: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
          vel: new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10),
          rot: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
        });
      }
      setParticles(p);
    }
  }, [isShattering]);

  useFrame((state, delta) => {
    if (isShattering && groupRef.current) {
      groupRef.current.children.forEach((child, idx) => {
        if (particles[idx]) {
          child.position.addScaledVector(particles[idx].vel, delta);
          child.rotation.x += particles[idx].rot.x * delta * 5;
          child.rotation.y += particles[idx].rot.y * delta * 5;
          child.scale.multiplyScalar(0.96);
        }
      });
    }
  });

  if (isShattering) {
    return (
      <group ref={groupRef}>
        {particles.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group>
      {/* Chains */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.2, 0.2, 9, 8]} />
        <meshStandardMaterial color="#92400e" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.2, 0.2, 9, 8]} />
        <meshStandardMaterial color="#92400e" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Lock */}
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[1.8, 2.2, 0.9]} />
        <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Keyhole */}
      <mesh position={[0, -0.2, 0.96]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
};

// ==========================================
// CỔNG CHÍNH (PORTAL COMPONENT)
// ==========================================
const Portal = ({ position, color, branchId, name, subtitle, requiredItems }) => {
  const { unlockedPortals, setViewState, setCurrentBranch, setLockedPortalTarget } = useGameStore();
  const [wasUnlocked, setWasUnlocked] = useState(unlockedPortals.includes(branchId));
  const isUnlocked = unlockedPortals.includes(branchId);
  const [isShattering, setIsShattering] = useState(false);

  useEffect(() => {
    if (!wasUnlocked && isUnlocked) {
      playGameSfx('unlock');
      setIsShattering(true);
      setTimeout(() => {
        setIsShattering(false);
        setWasUnlocked(true);
      }, 2000);
    } else if (wasUnlocked && !isUnlocked) {
      setWasUnlocked(false);
      setIsShattering(false);
    }
  }, [isUnlocked, wasUnlocked]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isUnlocked) {
      playGameSfx('portal');
      setCurrentBranch(branchId);
      setViewState('WARPING');
      setTimeout(() => {
        setViewState('BRANCH');
      }, 2500);
    } else {
      playGameSfx('locked');
      setLockedPortalTarget(branchId);
    }
  };

  return (
    <group position={position}>
      {/* Hitbox bắt click */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[4.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Hiệu ứng hạt thiên hà nền */}
      <PortalGalaxy color={color} isUnlocked={isUnlocked} />

      {/* BIỂU TƯỢNG 3D ĐẶC TRƯNG TỪNG NHÁNH */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {branchId === 1 && <Branch1Visual isUnlocked={isUnlocked} />}
        {branchId === 2 && <Branch2Visual isUnlocked={isUnlocked} />}
        {branchId === 3 && <Branch3Visual isUnlocked={isUnlocked} />}
        {branchId === 'BOSS' && <BossVisual isUnlocked={isUnlocked} />}
      </Float>

      {!wasUnlocked && <LockAndChains isShattering={isShattering} />}

      {/* Nhãn HTML Dưới Chân Cổng */}
      <Html position={[0, -5.5, 0]} center>
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            fontFamily: 'Segoe UI, sans-serif',
            width: '280px',
            pointerEvents: 'none',
            userSelect: 'none',
            background: 'rgba(15, 6, 10, 0.75)',
            padding: '10px 16px',
            borderRadius: '16px',
            border: `1px solid ${isUnlocked ? color : 'rgba(255,255,255,0.15)'}`,
            boxShadow: isUnlocked ? `0 0 20px ${color}40` : 'none',
            backdropFilter: 'blur(8px)',
          }}
        >
          <h4
            style={{
              margin: '0 0 4px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              color: isUnlocked ? '#fff' : '#94a3b8',
              textShadow: isUnlocked ? `0 0 10px ${color}` : 'none',
              letterSpacing: '0.5px',
            }}
          >
            {name}
          </h4>
          <div style={{ fontSize: '12px', color: isUnlocked ? '#fef08a' : '#94a3b8', fontStyle: 'italic', marginBottom: '6px' }}>
            {subtitle}
          </div>
          {!isUnlocked && !isShattering && (
            <div
              style={{
                fontSize: '11px',
                color: '#f87171',
                fontWeight: 'bold',
                padding: '3px 8px',
                background: 'rgba(239, 68, 68, 0.15)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              🔒 Khóa kín (Cần: {requiredItems})
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// ==========================================
// DANH SÁCH 4 CỔNG TẠI SẢNH CHÍNH HUB
// ==========================================
const HubPortals = () => {
  const viewState = useGameStore((state) => state.viewState);
  if (viewState !== 'HUB') return null;

  return (
    <group>
      <Portal
        position={[-16, 0, 0]}
        color="#ef4444"
        branchId={1}
        name="Nhánh 1: Bản Thể Luận"
        subtitle="Vật Chất & Ý Thức"
        requiredItems="Mở sẵn"
      />
      <Portal
        position={[-5.5, 0, -8]}
        color="#f97316"
        branchId={2}
        name="Nhánh 2: Phép Biện Chứng"
        subtitle="Mâu Thuẫn & Lượng - Chất"
        requiredItems="Chìa khóa Nhãn quan"
      />
      <Portal
        position={[5.5, 0, -8]}
        color="#eab308"
        branchId={3}
        name="Nhánh 3: Lý Luận Nhận Thức"
        subtitle="Thực Tiễn & Chân Lý"
        requiredItems="Chìa khóa Bước nhảy tri thức"
      />
      <Portal
        position={[16, 0, 0]}
        color="#fffbeb"
        branchId="BOSS"
        name="Kho Tàng Tối Thượng"
        subtitle="Bánh Xe Lịch Sử"
        requiredItems="vượt qua nhánh 3"
      />
    </group>
  );
};

export default HubPortals;
