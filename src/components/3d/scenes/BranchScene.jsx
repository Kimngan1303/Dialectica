import React, { useMemo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playGameSfx } from '../../audio/AmbientAudio';
import { useGameStore } from '../../../store/useGameStore';
import questionsData from '../../../data/questions.json';

const Branch1Background = () => {
  const crystalsRef = useRef();
  
  const [positions, rotations, colors] = useMemo(() => {
    const pos = [];
    const rot = [];
    const col = [];
    const colorTheme = new THREE.Color("#dc2626"); // Crimson Ruby Crystals

    for (let i = 0; i < 60; i++) {
      pos.push((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80 - 20);
      rot.push(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const c = colorTheme.clone();
      c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
      col.push(c.r, c.g, c.b);
    }
    return [new Float32Array(pos), new Float32Array(rot), new Float32Array(col)];
  }, []);

  useFrame((state) => {
    if (crystalsRef.current) {
      crystalsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      crystalsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={crystalsRef}>
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[positions[i*3], positions[i*3+1], positions[i*3+2]]}
          rotation={[rotations[i*3], rotations[i*3+1], rotations[i*3+2]]}
        >
          <octahedronGeometry args={[Math.random() * 1.5 + 0.5]} />
          <meshStandardMaterial 
            color={new THREE.Color(colors[i*3], colors[i*3+1], colors[i*3+2])} 
            transparent opacity={0.6} wireframe={Math.random() > 0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

const ShootingStarsBackground = () => {
  const starsGroupRef = useRef();
  
  const stars = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      z: (Math.random() - 0.5) * 100,
      speed: Math.random() * 50 + 50,
      length: Math.random() * 10 + 5
    }));
  }, []);

  useFrame((state, delta) => {
    if (starsGroupRef.current) {
      starsGroupRef.current.children.forEach((mesh, i) => {
        if (!stars[i]) return;
        mesh.position.x += stars[i].speed * delta;
        mesh.position.y -= stars[i].speed * delta * 0.5;
        // Reset when out of bounds
        if (mesh.position.x > 50) {
          mesh.position.x = -50;
          mesh.position.y = (Math.random() - 0.5) * 100;
        }
      });
    }
  });

  return (
    <group>
      <group ref={starsGroupRef}>
        {stars.map((star, i) => (
          <mesh key={i} position={[star.x, star.y, star.z]} rotation={[0, 0, -Math.PI / 8]}>
            <cylinderGeometry args={[0.05, 0.05, star.length, 4]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
      <pointLight color="#3b82f6" intensity={2} distance={100} />
    </group>
  );
};

// ==========================================
// BACKGROUND NHÁNH 1: KHÔNG GIAN BẢN THỂ LUẬN (THỰC TẠI VẬT CHẤT KHÁCH QUAN)
// ==========================================
const MaterialRealmBackground = () => {
  const monolithRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const particlesRef = useRef();

  const [particlesPos, particlesCol] = useMemo(() => {
    const pos = [];
    const col = [];
    const colorRed = new THREE.Color("#ef4444");
    const colorAmber = new THREE.Color("#f59e0b");

    for (let i = 0; i < 1800; i++) {
      const radius = Math.random() * 80 + 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) * 0.6,
        radius * Math.cos(phi) - 30
      );

      const mixed = colorRed.clone().lerp(colorAmber, Math.random());
      col.push(mixed.r, mixed.g, mixed.b);
    }
    return [new Float32Array(pos), new Float32Array(col)];
  }, []);

  useFrame((state, delta) => {
    if (monolithRef.current) {
      monolithRef.current.rotation.y += delta * 0.35;
      monolithRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.6;
      ring1Ref.current.rotation.z += delta * 0.4;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.5;
      ring2Ref.current.rotation.x -= delta * 0.3;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* 1. ĐẠI TINH THỂ BẢN THỂ KHÁCH QUAN Ở TÂM HẬU CẢNH */}
      <group position={[0, 0, -38]}>
        {/* Khối pha lê trung tâm */}
        <mesh ref={monolithRef} scale={[6, 10, 6]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={2}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>
        {/* Khung đa diện wireframe ngoài */}
        <mesh scale={[7.5, 12, 7.5]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={1} wireframe />
        </mesh>
        {/* Vòng đai năng lượng 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[13, 0.25, 16, 64]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2} />
        </mesh>
        {/* Vòng đai năng lượng 2 */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[15, 0.18, 16, 64]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.5} />
        </mesh>
        <pointLight color="#ef4444" intensity={8} distance={150} />
        <pointLight color="#fbbf24" intensity={6} distance={100} />
      </group>

      {/* 2. ĐÁM HẠT NĂNG LƯỢNG LƯỢNG TỬ VẬT CHẤT (QUANTUM MATTER FIELD) */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlesPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[particlesCol, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.35} vertexColors transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* 3. CÁC MẢNH PHA LÊ TRÔI NỔI LƠ LỬNG */}
      <group>
        {[-25, -15, 18, 28, -20, 22].map((x, i) => (
          <mesh key={i} position={[x, ((i % 3) - 1) * 12, -15 - i * 4]} rotation={[i, i * 2, 0]} scale={[1.2, 2.2, 1.2]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#ef4444" emissive="#991b1b" emissiveIntensity={0.8} transparent opacity={0.65} wireframe={i % 2 === 0} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const InfiniteGalaxiesBackground = () => {
  const outerLayer = useRef();
  const innerLayer = useRef();

  const [outerPoints, innerPoints] = useMemo(() => {
    const createLayer = (count, radius, colorHex) => {
      const pos = [];
      const col = [];
      const colorObj = new THREE.Color(colorHex);
      for(let i=0; i<count; i++){
        const r = Math.random() * radius + 10;
        const theta = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * (radius / 3);
        pos.push(r * Math.cos(theta), y, r * Math.sin(theta));
        
        const c = colorObj.clone();
        c.offsetHSL(Math.random() * 0.2, 0, (Math.random() - 0.5) * 0.5);
        col.push(c.r, c.g, c.b);
      }
      return [new Float32Array(pos), new Float32Array(col)];
    };
    return [createLayer(3000, 80, "#a855f7"), createLayer(2000, 40, "#ec4899")];
  }, []);

  useFrame((state, delta) => {
    if (outerLayer.current) outerLayer.current.rotation.y += delta * 0.05; // Slow rotation
    if (innerLayer.current) innerLayer.current.rotation.y += delta * 0.15; // Fast rotation
  });

  return (
    <group position={[0, -10, -20]}>
      {/* Stationary Core */}
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight color="#ffffff" intensity={8} distance={200} />
      </mesh>
      
      {/* Inner Fast Nebula */}
      <points ref={innerLayer}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[innerPoints[0], 3]} />
          <bufferAttribute attach="attributes-color" args={[innerPoints[1], 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.8} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Outer Slow Nebula */}
      <points ref={outerLayer}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outerPoints[0], 3]} />
          <bufferAttribute attach="attributes-color" args={[outerPoints[1], 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.4} vertexColors transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
};

const NeuralConnections = ({ nodePositions, branchQuestions, answeredQuestions }) => {
  const lines = useMemo(() => {
    const pts = [];
    const answeredInBranch = branchQuestions.filter(q => answeredQuestions.includes(q.id));
    answeredInBranch.sort((a, b) => a.id - b.id);
    
    for (let i = 0; i < answeredInBranch.length - 1; i++) {
      const p1 = nodePositions[branchQuestions.indexOf(answeredInBranch[i])];
      const p2 = nodePositions[branchQuestions.indexOf(answeredInBranch[i+1])];
      if (p1 && p2) {
        pts.push(p1, p2);
      }
    }
    return pts;
  }, [nodePositions, branchQuestions, answeredQuestions]);

  if (lines.length === 0) return null;

  return (
    <lineSegments>
      <bufferGeometry>
         <bufferAttribute attach="attributes-position" args={[new Float32Array(lines.flatMap(v => [v.x, v.y, v.z])), 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.8} linewidth={2} />
    </lineSegments>
  );
};

const RadiantCore = () => {
  const coreRef = useRef();
  useFrame((state) => {
    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      coreRef.current.scale.setScalar(scale);
      coreRef.current.rotation.y += 0.02;
      coreRef.current.rotation.x += 0.01;
    }
  });

  return (
    <group ref={coreRef}>
      <mesh>
        <icosahedronGeometry args={[8, 2]} />
        <meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={4} wireframe />
      </mesh>
      <pointLight color="#ffffff" intensity={10} distance={200} />
      <mesh>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#fcd34d" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ==========================================
// CÁC TINH HỆ NHỎ RIÊNG BIỆT CHO TỪNG NODE NHÁNH 1 (8 TINH HỆ KHÁC BIỆT HOÀN TOÀN)
// ==========================================
const Branch1MiniSystem = ({ index, isAnswered, isHovered, isCooldown }) => {
  const groupRef = useRef();
  const subRef1 = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.5 + (index % 3) * 0.2);
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.15;
    }
    if (subRef1.current) {
      subRef1.current.rotation.z += delta * 1.5;
      subRef1.current.rotation.x += delta * 0.8;
    }
  });

  const mainColor = isAnswered ? '#fbbf24' : isCooldown ? '#ef4444' : isHovered ? '#fde047' : '#ef4444';
  const emissiveColor = isAnswered ? '#f59e0b' : isCooldown ? '#7f1d1d' : isHovered ? '#f59e0b' : '#991b1b';
  const emissiveIntensity = isAnswered ? 2.5 : isHovered ? 2.2 : 0.85;

  switch (index % 8) {
    case 0:
      // 1. Dual-Sphere Binary System (Cực Nhị Nguyên Đối Ngẫu: 2 quả cầu quay quanh nhau + vành đai)
      return (
        <group ref={groupRef}>
          <mesh position={[-1.2, 0, 0]}>
            <sphereGeometry args={[0.9, 24, 24]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[1.2, 0, 0]}>
            <sphereGeometry args={[0.7, 24, 24]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.8} roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh ref={subRef1} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[2.0, 0.08, 16, 48]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.5} />
          </mesh>
        </group>
      );

    case 1:
      // 2. Cosmic Hypercube / Tesseract (Khối Lập Phương Bản Thể với Lõi Pha Lê Bên Trong)
      return (
        <group ref={groupRef}>
          <mesh scale={[1.8, 1.8, 1.8]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} wireframe />
          </mesh>
          <mesh ref={subRef1}>
            <octahedronGeometry args={[0.95, 0]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      );

    case 2:
      // 3. Radiant Octahedron with Orbital Satellite (Bát Diện Pha Lê Kèm Vệ Tinh Phản Ánh)
      return (
        <group ref={groupRef}>
          <mesh scale={[1.3, 2.0, 1.3]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} roughness={0.15} metalness={0.85} />
          </mesh>
          <group ref={subRef1}>
            <mesh position={[2.2, 0, 0]}>
              <sphereGeometry args={[0.42, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2.5} />
            </mesh>
          </group>
        </group>
      );

    case 3:
      // 4. Ringed Celestial Planet (Hành Tinh Vành Đai Sao Thổ - Thực Tại Khách Quan Vĩnh Cửu)
      return (
        <group ref={groupRef}>
          <mesh>
            <sphereGeometry args={[1.35, 32, 32]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} roughness={0.25} metalness={0.75} />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0.2, 0]}>
            <torusGeometry args={[2.5, 0.22, 16, 64]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2.0} roughness={0.3} />
          </mesh>
        </group>
      );

    case 4:
      // 5. Quantum Energy Torus Dynamo (Hình Xuyến Năng Lượng Lượng Tử Xoay Dọc)
      return (
        <group ref={groupRef}>
          <mesh ref={subRef1} rotation={[0, 0, Math.PI / 6]}>
            <torusGeometry args={[1.5, 0.42, 24, 48]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} wireframe={!isHovered && !isAnswered} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.72, 24, 24]} />
            <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={2.6} />
          </mesh>
        </group>
      );

    case 5:
      // 6. Sacred Dodecahedron (Đa Diện 12 Mặt Hoàng Đạo - Ý Thức Xã Hội & Ngôn Ngữ)
      return (
        <group ref={groupRef}>
          <mesh scale={[1.3, 1.3, 1.3]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh scale={[1.65, 1.65, 1.65]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} wireframe />
          </mesh>
        </group>
      );

    case 6:
      // 7. Dual Pyramid / Bi-Cone (Kim Tự Tháp Kép / Nón Đôi Pha Lê Với Vòng Vệ Tinh)
      return (
        <group ref={groupRef}>
          <mesh position={[0, 0.85, 0]}>
            <coneGeometry args={[1.1, 1.7, 4]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.85, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[1.1, 1.7, 4]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh ref={subRef1} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.85, 0.08, 16, 32]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2} />
          </mesh>
        </group>
      );

    case 7:
    default:
      // 8. Icosahedral Star Cluster (Cụm Tinh Tú 20 Mặt Đa Diện Với Vệ Tinh Đôi)
      return (
        <group ref={groupRef}>
          <mesh scale={[1.4, 1.4, 1.4]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={mainColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} roughness={0.15} metalness={0.85} />
          </mesh>
          <group ref={subRef1}>
            <mesh position={[2.1, 0.8, 0]}>
              <sphereGeometry args={[0.32, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2.2} />
            </mesh>
            <mesh position={[-2.1, -0.8, 0]}>
              <sphereGeometry args={[0.32, 16, 16]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={2.2} />
            </mesh>
          </group>
        </group>
      );
  }
};

const BranchNode = ({
  question,
  index,
  position,
  currentBranch,
  isAnswered,
  isCooldown,
  isHovered,
  onPointerOver,
  onPointerOut,
  onClick
}) => {
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1.5, 32, 32), []);
  const icosahedronGeo = useMemo(() => new THREE.IcosahedronGeometry(1.5, 0), []);
  const dodecahedronGeo = useMemo(() => new THREE.DodecahedronGeometry(4, 0), []);

  const baseColor = currentBranch === 2 ? '#f97316' : currentBranch === 3 ? '#eab308' : '#ffffff';
  const nodeMat = isAnswered 
    ? new THREE.MeshStandardMaterial({ color: '#fbbf24', emissive: '#f59e0b', emissiveIntensity: 2 })
    : isCooldown 
    ? new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#7f1d1d', emissiveIntensity: 0.5 })
    : isHovered 
    ? new THREE.MeshStandardMaterial({ color: '#fde047', emissive: '#f59e0b', emissiveIntensity: 1.5 })
    : new THREE.MeshStandardMaterial({ color: baseColor, emissive: baseColor, emissiveIntensity: 0.3 });

  const otherGeo = currentBranch === 2 ? icosahedronGeo : currentBranch === 'BOSS' ? dodecahedronGeo : sphereGeo;
  const scale = isHovered ? 1.25 : 1.0;

  return (
    <group 
      position={position}
      scale={[scale, scale, scale]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Invisible Click/Hover Collider to make selecting effortless */}
      <mesh visible={false}>
        <sphereGeometry args={[2.8, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* If Branch 1: Render the unique star system per index */}
      {currentBranch === 1 ? (
        <Branch1MiniSystem 
          index={index}
          isAnswered={isAnswered}
          isHovered={isHovered}
          isCooldown={isCooldown}
        />
      ) : (
        <mesh geometry={otherGeo} material={nodeMat} />
      )}

      {/* Illuminated Node Light */}
      {isAnswered && (
        <pointLight color="#fbbf24" intensity={3} distance={15} />
      )}
    </group>
  );
};

const BranchScene = () => {
  const { viewState, currentBranch, answeredQuestions, cooldownNodes, setActiveNode, setViewState } = useGameStore();
  const [hoveredNode, setHoveredNode] = useState(null);

  const branchQuestions = useMemo(() => {
    if (!currentBranch) return [];
    if (currentBranch === 'BOSS') return questionsData.filter(q => q.branchId === 4 || q.branchId === 'BOSS' || q.id === 25);
    return questionsData.filter(q => q.branchId == currentBranch);
  }, [currentBranch]);

  const isCompleted = branchQuestions.length > 0 && branchQuestions.every(q => answeredQuestions.includes(q.id));

  const nodePositions = useMemo(() => {
    const positions = [];
    const n = branchQuestions.length;
    
    if (currentBranch === 'BOSS') {
      positions.push(new THREE.Vector3(0, 0, 0));
      return positions;
    }

    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 12 + (i % 3) * 4;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.push(new THREE.Vector3(x, y, z));
    }
    return positions;
  }, [branchQuestions, currentBranch]);

  const handleNodeClick = (e, q, idx) => {
    e.stopPropagation();
    if (answeredQuestions.includes(q.id)) return;
    if (cooldownNodes[q.id]) return;

    if (viewState === 'BRANCH') {
      playGameSfx('navigate');
      const globalIndex = questionsData.findIndex(item => item.id === q.id);
      setActiveNode(globalIndex);
      setViewState('QUESTION');
    }
  };

  if (viewState !== 'BRANCH') return null;

  return (
    <group>
      {/* Background conditionally rendered based on Branch */}
      {currentBranch === 1 && <MaterialRealmBackground />}
      {currentBranch === 2 && <ShootingStarsBackground />}
      {currentBranch === 3 && <Branch1Background />}
      {currentBranch === 'BOSS' && <InfiniteGalaxiesBackground />}
      
      <NeuralConnections nodePositions={nodePositions} branchQuestions={branchQuestions} answeredQuestions={answeredQuestions} />
      
      {isCompleted && <RadiantCore />}

      {nodePositions.map((pos, idx) => {
        const q = branchQuestions[idx];
        const isAnswered = answeredQuestions.includes(q.id);
        const isCooldown = Boolean(cooldownNodes[q.id]);
        const isHovered = hoveredNode === idx;

        return (
          <BranchNode
            key={q.id}
            question={q}
            index={idx}
            position={pos}
            currentBranch={currentBranch}
            isAnswered={isAnswered}
            isCooldown={isCooldown}
            isHovered={isHovered}
            onPointerOver={(e) => {
              e.stopPropagation();
              if (!isAnswered && !isCooldown) {
                setHoveredNode(idx);
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={(e) => {
              setHoveredNode(null);
              document.body.style.cursor = 'default';
            }}
            onClick={(e) => handleNodeClick(e, q, idx)}
          />
        );
      })}
    </group>
  );
};
export default BranchScene;
