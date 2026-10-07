import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Level2Minigame.css';
import { useGameStore } from '../../store/useGameStore.js';
import { playGameSfx } from '../audio/AmbientAudio.jsx';

const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 2200;
const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 600;

// Platform configuration
const INITIAL_PLATFORMS = [
    // Ground
    { id: 'g0', x: 0, y: 2120, w: 800, h: 80, type: 'ground', label: 'Bản Thể Khách Quan' },
    // Level 1: Tích lũy về Lượng
    { id: 'p1', x: 120, y: 1980, w: 180, h: 22, type: 'normal', label: 'Tích Lũy 1' },
    { id: 'p2', x: 380, y: 1860, w: 180, h: 22, type: 'normal', label: 'Tích Lũy 2' },
    { id: 'p3', x: 600, y: 1730, w: 160, h: 22, type: 'normal', label: 'Giới Hạn Độ' },
    { id: 'p4', x: 320, y: 1610, w: 180, h: 22, type: 'normal', label: 'Tiệm Cận Điểm Nút' },
    
    // Jump Pad 1: Điểm Nút bùng nổ Bước Nhảy
    { id: 's1', x: 120, y: 1530, w: 130, h: 22, type: 'spring', label: 'BƯỚC NHẢY CHẤT 🚀' },
    
    // Level 2: Vận động Mâu thuẫn (bệ chuyển động)
    { id: 'p5', x: 300, y: 1340, w: 160, h: 22, type: 'moving', minX: 180, maxX: 580, vx: 1.8, label: 'Mâu Thuẫn Vận Động' },
    { id: 'p6', x: 620, y: 1210, w: 150, h: 22, type: 'normal', label: 'Phủ Định Lần 1' },
    { id: 'p7', x: 280, y: 1090, w: 160, h: 22, type: 'normal', label: 'Tính Kế Thừa' },
    { id: 'p8', x: 70, y: 970, w: 140, h: 22, type: 'normal', label: 'Cực Luận Đề' },
    { id: 'p9', x: 320, y: 870, w: 170, h: 22, type: 'moving', minX: 200, maxX: 560, vx: 2.2, label: 'Cực Phản Đề' },
    
    // Jump Pad 2: Phủ Định của Phủ Định
    { id: 's2', x: 620, y: 790, w: 130, h: 22, type: 'spring', label: 'XOÁY ỐC VƯƠN CAO 🚀' },
    
    // Level 3: Tiệm cận Chân lý
    { id: 'p10', x: 360, y: 610, w: 160, h: 22, type: 'normal', label: 'Tiệm Cận Chân Lý' },
    { id: 'p11', x: 150, y: 490, w: 150, h: 22, type: 'normal', label: 'Hợp Đề Tối Cao' },
    { id: 'p12', x: 500, y: 390, w: 160, h: 22, type: 'normal', label: 'Cổng Khải Hoàn' },
    
    // Summit Platform
    { id: 'summit', x: 250, y: 250, w: 300, h: 32, type: 'summit', label: 'ĐỈNH CAO BIỆN CHỨNG' },
];

const INITIAL_GEMS = [
    { id: 1, x: 680, y: 1680, name: 'Tinh Thể Lượng', icon: '💎', color: '#f59e0b', desc: 'Tích lũy Lượng' },
    { id: 2, x: 90, y: 920, name: 'Tinh Thể Chất', icon: '✨', color: '#ef4444', desc: 'Bước nhảy Chất' },
    { id: 3, x: 180, y: 440, name: 'Tinh Thể Hợp Đề', icon: '🌟', color: '#fbbf24', desc: 'Thống nhất Đối lập' },
];

const INITIAL_HAZARDS = [
    { x: 380, y: 1592, w: 45, h: 18, label: 'BẪY SIÊU HÌNH' },
    { x: 320, y: 1072, w: 45, h: 18, label: 'PHIẾN DIỆN' },
    { x: 420, y: 592, w: 45, h: 18, label: 'GIÁO ĐIỀU' },
];

const Level2Minigame = () => {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const requestRef = useRef();

    const { setViewState, setRewardPopup } = useGameStore();

    // UI State
    const [gameState, setGameState] = useState('PLAYING'); // PLAYING, VICTORY
    const [collectedGems, setCollectedGems] = useState(0);
    const [altitudePercent, setAltitudePercent] = useState(0);
    const [hintVisible, setHintVisible] = useState(true);
    const [statusToast, setStatusToast] = useState('');

    const toastTimeoutRef = useRef(null);
    const showToast = (msg) => {
        setStatusToast(msg);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setStatusToast(''), 3000);
    };

    // Engine State
    const stateRef = useRef({
        player: {
            x: 400,
            y: 2060,
            w: 28,
            h: 44,
            vx: 0,
            vy: 0,
            isGrounded: false,
            facing: 'right',
            jumpsLeft: 2,
            checkpoint: { x: 400, y: 2060 },
            highestY: 2060,
        },
        cameraY: 1550,
        keys: { left: false, right: false, up: false },
        platforms: JSON.parse(JSON.stringify(INITIAL_PLATFORMS)),
        gems: INITIAL_GEMS.map(g => ({ ...g, collected: false })),
        hazards: JSON.parse(JSON.stringify(INITIAL_HAZARDS)),
        particles: [],
        stars: Array.from({ length: 45 }, () => ({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            r: Math.random() * 2 + 1,
            alpha: Math.random() * 0.7 + 0.3
        })),
        winTriggered: false
    });

    const triggerJump = useCallback(() => {
        const p = stateRef.current.player;
        if (p.isGrounded || p.jumpsLeft > 0) {
            p.vy = -11.8;
            p.isGrounded = false;
            p.jumpsLeft -= 1;
            playGameSfx('liquid');

            // Spawn jump ring particles
            for (let i = 0; i < 8; i++) {
                stateRef.current.particles.push({
                    x: p.x + p.w / 2,
                    y: p.y + p.h,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 2 + 1,
                    life: 1,
                    color: p.jumpsLeft === 1 ? '#fbbf24' : '#ef4444'
                });
            }
        }
    }, []);

    // Handle Victory
    const handleWin = useCallback(() => {
        if (stateRef.current.winTriggered) return;
        stateRef.current.winTriggered = true;
        playGameSfx('correct');
        setGameState('VICTORY');
    }, []);

    const handleExit = () => {
        playGameSfx('unlock');
        setRewardPopup({ id: 'badge2', name: 'Chìa khóa Bước nhảy tri thức', icon: '🗝️', targetViewState: 'HUB' });
        setViewState('HUB');
    };

    // Keyboard Listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
            const keys = stateRef.current.keys;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
            if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
                if (!keys.up) {
                    keys.up = true;
                    triggerJump();
                }
            }
            if (e.code === 'KeyR') {
                // Respawn at checkpoint
                const p = stateRef.current.player;
                p.x = p.checkpoint.x;
                p.y = p.checkpoint.y;
                p.vx = 0;
                p.vy = 0;
                showToast("Đã hồi sinh tại Nấc Thang gần nhất!");
            }
        };

        const handleKeyUp = (e) => {
            const keys = stateRef.current.keys;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
            if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keys.up = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [triggerJump]);

    // Responsive scaling
    useEffect(() => {
        const handleResize = () => {
            if (wrapperRef.current) {
                const scale = Math.min(window.innerWidth / 850, window.innerHeight / 650);
                wrapperRef.current.style.transform = `scale(${scale})`;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-hide hint
    useEffect(() => {
        const t = setTimeout(() => setHintVisible(false), 5000);
        return () => clearTimeout(t);
    }, []);

    // Fixed-timestep Game Loop with Canvas (Consistent physics on both 60Hz and 120Hz/144Hz+ screens)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let lastTime = performance.now();
        let accumulator = 0;
        const FIXED_STEP = 1000 / 60; // 60 FPS physics standard (16.67ms)

        const updatePhysics = () => {
            const state = stateRef.current;
            const p = state.player;

            // 1. Move Player
            const accel = 0.75;
            const maxSpeed = 4.8;
            if (state.keys.left) {
                p.vx -= accel;
                p.facing = 'left';
            } else if (state.keys.right) {
                p.vx += accel;
                p.facing = 'right';
            } else {
                p.vx *= 0.84; // friction
            }
            p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));

            // Gravity
            p.vy += 0.46;
            if (p.vy > 13) p.vy = 13;

            // Next position
            p.x += p.vx;
            p.y += p.vy;

            // Boundary X
            if (p.x < 10) { p.x = 10; p.vx = 0; }
            if (p.x + p.w > WORLD_WIDTH - 10) { p.x = WORLD_WIDTH - 10 - p.w; p.vx = 0; }

            // 2. Update Moving Platforms
            state.platforms.forEach(plat => {
                if (plat.type === 'moving') {
                    plat.x += plat.vx;
                    if (plat.x < plat.minX || plat.x + plat.w > plat.maxX) {
                        plat.vx = -plat.vx;
                    }
                }
            });

            // 3. Collision with Platforms (landing on top)
            p.isGrounded = false;
            state.platforms.forEach(plat => {
                const prevY = p.y - p.vy;
                const isAbove = prevY + p.h <= plat.y + 6;
                const isWithinX = p.x + p.w > plat.x && p.x < plat.x + plat.w;
                const isCrossing = p.y + p.h >= plat.y && p.y + p.h <= plat.y + plat.h + 8;

                if (isAbove && isCrossing && isWithinX && p.vy >= 0) {
                    p.y = plat.y - p.h;
                    p.vy = 0;
                    p.isGrounded = true;
                    p.jumpsLeft = 2; // Restore double jump

                    // If moving platform, carry player
                    if (plat.type === 'moving') {
                        p.x += plat.vx;
                    }

                    // Check if spring / jump pad
                    if (plat.type === 'spring') {
                        p.vy = -17.0;
                        p.isGrounded = false;
                        playGameSfx('craft');
                        showToast("BÙNG NỔ BƯỚC NHẢY VỀ CHẤT! 🚀");
                        for (let i = 0; i < 15; i++) {
                            state.particles.push({
                                x: plat.x + plat.w / 2,
                                y: plat.y,
                                vx: (Math.random() - 0.5) * 8,
                                vy: -Math.random() * 6 - 2,
                                life: 1,
                                color: '#f59e0b'
                            });
                        }
                    }

                    // Check if Summit Platform
                    if (plat.type === 'summit') {
                        handleWin();
                    }

                    // Update Checkpoint as player climbs higher
                    if (plat.y < p.highestY - 200 && plat.type !== 'ground') {
                        p.highestY = plat.y;
                        p.checkpoint = { x: plat.x + plat.w / 2 - p.w / 2, y: plat.y - p.h - 10 };
                        showToast(`🚩 Nấc Thang Nhận Thức Mới: ${plat.label}`);
                    }
                }
            });

            // 4. Collect Gems
            state.gems.forEach(gem => {
                if (!gem.collected) {
                    const dist = Math.hypot((p.x + p.w / 2) - gem.x, (p.y + p.h / 2) - gem.y);
                    if (dist < 32) {
                        gem.collected = true;
                        playGameSfx('pickup');
                        showToast(`ĐÃ THU THẬP: ${gem.name.toUpperCase()}! ${gem.desc}`);
                        setCollectedGems(prev => prev + 1);

                        // Spawn sparkle particles
                        for (let i = 0; i < 12; i++) {
                            state.particles.push({
                                x: gem.x,
                                y: gem.y,
                                vx: (Math.random() - 0.5) * 6,
                                vy: (Math.random() - 0.5) * 6,
                                life: 1,
                                color: gem.color
                            });
                        }
                    }
                }
            });

            // 5. Check Hazards Collision
            state.hazards.forEach(hz => {
                const hitX = p.x + p.w > hz.x && p.x < hz.x + hz.w;
                const hitY = p.y + p.h > hz.y && p.y < hz.y + hz.h;
                if (hitX && hitY) {
                    playGameSfx('wrong');
                    p.vy = -5.5;
                    p.vx = p.x < hz.x ? -4.5 : 4.5;
                    showToast(`⚠️ Va phải ${hz.label}! Tư duy siêu hình cản trở nhận thức!`);
                }
            });

            // 6. Fall off bottom -> Respawn at Checkpoint
            if (p.y > WORLD_HEIGHT + 100) {
                p.x = p.checkpoint.x;
                p.y = p.checkpoint.y;
                p.vx = 0;
                p.vy = 0;
                playGameSfx('wrong');
                showToast("Rơi khỏi nấc thang! Tái lập tư duy tại Trạm kiểm soát.");
            }

            // 7. Update Particles
            for (let i = state.particles.length - 1; i >= 0; i--) {
                const part = state.particles[i];
                part.x += part.vx;
                part.y += part.vy;
                part.life -= 0.025;
                if (part.life <= 0) {
                    state.particles.splice(i, 1);
                }
            }

            // 8. Smooth Camera tracking
            const targetCamY = p.y - 340;
            state.cameraY += (targetCamY - state.cameraY) * 0.08;
            state.cameraY = Math.max(0, Math.min(WORLD_HEIGHT - VIEW_HEIGHT, state.cameraY));
        };

        const loop = (now) => {
            if (!now) now = performance.now();
            const elapsed = Math.min(now - lastTime, 100); // Prevent large jumps when tab is in background
            lastTime = now;
            accumulator += elapsed;

            // Execute fixed number of physics steps according to elapsed time
            while (accumulator >= FIXED_STEP) {
                updatePhysics();
                accumulator -= FIXED_STEP;
            }

            const state = stateRef.current;
            const p = state.player;

            // Calculate altitude %
            const currentAlt = Math.max(0, Math.min(100, Math.floor(((2120 - p.y) / (2120 - 250)) * 100)));
            setAltitudePercent(currentAlt);

            // --- RENDER CANVAS ---
            ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
            ctx.save();
            ctx.translate(0, -state.cameraY);

            // Background Spiral Pattern
            const spiralCenterY = 1100;
            ctx.save();
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.06)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let a = 0; a < 25; a += 0.1) {
                const r = a * 18;
                const sx = 400 + Math.cos(a) * r;
                const sy = spiralCenterY + Math.sin(a) * r * 0.7;
                if (a === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            ctx.restore();

            // Background Stars
            state.stars.forEach(st => {
                ctx.fillStyle = `rgba(251, 191, 36, ${st.alpha})`;
                ctx.beginPath();
                ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
                ctx.fill();
            });

            // --- Render Platforms ---
            state.platforms.forEach(plat => {
                ctx.save();
                if (plat.type === 'ground') {
                    ctx.fillStyle = '#1c080f';
                    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
                } else if (plat.type === 'spring') {
                    // Jump Pad (Gold & Red with pulsating glow)
                    const pulse = Math.sin(Date.now() / 150) * 4;
                    ctx.fillStyle = 'linear-gradient(135deg, #f59e0b, #dc2626)';
                    ctx.fillRect(plat.x, plat.y - pulse, plat.w, plat.h + pulse);
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = '#fbbf24';
                    ctx.shadowBlur = 15;
                    ctx.strokeRect(plat.x, plat.y - pulse, plat.w, plat.h + pulse);
                } else if (plat.type === 'summit') {
                    // Summit Platform
                    ctx.fillStyle = '#260a12';
                    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#f59e0b';
                    ctx.shadowBlur = 25;
                    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

                    // Altar of Truth Totem on the summit
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 36px serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('🏛️', plat.x + plat.w / 2, plat.y - 15);
                } else {
                    // Normal / Moving platform
                    ctx.fillStyle = plat.type === 'moving' ? '#3b111c' : '#2b0b14';
                    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
                    ctx.strokeStyle = plat.type === 'moving' ? '#f59e0b' : '#b91c1c';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
                }

                // Platform label text
                ctx.fillStyle = plat.type === 'spring' ? '#fff' : '#fde68a';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(plat.label, plat.x + plat.w / 2, plat.y + 15);
                ctx.restore();
            });

            // --- Render Hazards ---
            state.hazards.forEach(hz => {
                ctx.save();
                ctx.fillStyle = '#991b1b';
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 10;
                // Draw Spikes
                ctx.beginPath();
                ctx.moveTo(hz.x, hz.y + hz.h);
                ctx.lineTo(hz.x + hz.w / 4, hz.y);
                ctx.lineTo(hz.x + hz.w / 2, hz.y + hz.h);
                ctx.lineTo(hz.x + (hz.w * 3) / 4, hz.y);
                ctx.lineTo(hz.x + hz.w, hz.y + hz.h);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#fca5a5';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(hz.label, hz.x + hz.w / 2, hz.y - 5);
                ctx.restore();
            });

            // --- Render Gems ---
            state.gems.forEach(gem => {
                if (!gem.collected) {
                    const bob = Math.sin(Date.now() / 200 + gem.id) * 6;
                    ctx.save();
                    ctx.shadowColor = gem.color;
                    ctx.shadowBlur = 18;
                    ctx.font = '24px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(gem.icon, gem.x, gem.y + bob);

                    ctx.fillStyle = '#fef08a';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.fillText(gem.name, gem.x, gem.y + bob + 20);
                    ctx.restore();
                }
            });

            // --- Render Particles ---
            for (let i = 0; i < state.particles.length; i++) {
                const part = state.particles[i];
                ctx.fillStyle = part.color;
                ctx.globalAlpha = Math.max(0, part.life);
                ctx.beginPath();
                ctx.arc(part.x, part.y, 3 * part.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // --- Render Player Character ---
            ctx.save();
            ctx.translate(p.x, p.y);
            if (p.facing === 'left') {
                ctx.scale(-1, 1);
                ctx.translate(-p.w, 0);
            }

            // Aura glow
            ctx.shadowColor = p.jumpsLeft === 2 ? '#fbbf24' : '#ef4444';
            ctx.shadowBlur = 12;

            // Head
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(p.w / 2, 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Robe / Body
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(4, 18, p.w - 8, 16);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(4, 18, p.w - 8, 16);

            // Legs
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(6, 34, 6, 10);
            ctx.fillRect(p.w - 12, 34, 6, 10);

            // Name Tag above player
            ctx.restore();
            ctx.save();
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Lữ Khách', p.x + p.w / 2, p.y - 8);
            ctx.restore();

            ctx.restore();

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [handleWin]);

    return (
        <div className="l2-platformer-container">
            <div className="l2-platformer-wrapper" ref={wrapperRef}>
                {/* Canvas Game Arena */}
                <canvas 
                    ref={canvasRef} 
                    width={VIEW_WIDTH} 
                    height={VIEW_HEIGHT} 
                    className="l2-canvas"
                />

                {/* HUD Overlay */}
                <div className="l2-hud-layer">
                    {/* Top Left: Quest / Altitude Progress */}
                    <div className="l2-alt-meter">
                        <div className="l2-alt-title">🌀 ĐƯỜNG XOÁY ỐC BIỆN CHỨNG</div>
                        <div className="l2-alt-bar-wrap">
                            <div className="l2-alt-bar" style={{ width: `${altitudePercent}%` }}></div>
                        </div>
                        <div className="l2-alt-text">Độ cao: {altitudePercent}% (Đỉnh tháp: 100%)</div>
                    </div>

                    {/* Top Right: Gems Tracker & Reset */}
                    <div className="l2-gems-hud">
                        <div className="l2-gems-badge">
                            <span>💎 Tinh Thể: </span>
                            <strong>{collectedGems}/3</strong>
                        </div>
                        <button 
                            type="button" 
                            className="l2-reset-btn"
                            onClick={() => {
                                const p = stateRef.current.player;
                                p.x = p.checkpoint.x;
                                p.y = p.checkpoint.y;
                                p.vx = 0;
                                p.vy = 0;
                                showToast("Đã hồi sinh tại Nấc Thang gần nhất!");
                            }}
                        >
                            🔄 Trạm Hồi Sinh [R]
                        </button>
                    </div>

                    {/* Dynamic Toast Message */}
                    {statusToast && (
                        <div className="l2-status-toast">
                            {statusToast}
                        </div>
                    )}

                    {/* Initial Tutorial Hint */}
                    {hintVisible && (
                        <div className="l2-hint-box">
                            <div className="l2-hint-header">📜 QUY LUẬT PHỦ ĐỊNH CỦA PHỦ ĐỊNH</div>
                            <div className="l2-hint-desc">
                                Dùng phím <strong style={{ color: '#fbbf24' }}>A / D</strong> (hoặc Mũi tên) để di chuyển.<br/>
                                Nhấn <strong style={{ color: '#fbbf24' }}>SPACE / W</strong> để NHẢY (hỗ trợ <strong>Nhảy Đúp 2 lần</strong> trên không!).<br/>
                                Bước lên các bệ <strong>BƯỚC NHẢY CHẤT 🚀</strong> để phóng vút lên cao và chạm tới Đỉnh Tháp!
                            </div>
                        </div>
                    )}

                    {/* Touch / On-screen Controls (for mouse/touch user) */}
                    <div className="l2-touch-controls">
                        <div className="l2-touch-left-group">
                            <button 
                                className="l2-touch-btn"
                                onMouseDown={() => { stateRef.current.keys.left = true; }}
                                onMouseUp={() => { stateRef.current.keys.left = false; }}
                                onTouchStart={() => { stateRef.current.keys.left = true; }}
                                onTouchEnd={() => { stateRef.current.keys.left = false; }}
                            >
                                ◀
                            </button>
                            <button 
                                className="l2-touch-btn"
                                onMouseDown={() => { stateRef.current.keys.right = true; }}
                                onMouseUp={() => { stateRef.current.keys.right = false; }}
                                onTouchStart={() => { stateRef.current.keys.right = true; }}
                                onTouchEnd={() => { stateRef.current.keys.right = false; }}
                            >
                                ▶
                            </button>
                        </div>
                        <button 
                            className="l2-touch-btn l2-touch-jump"
                            onClick={triggerJump}
                        >
                            NHẢY ⇧
                        </button>
                    </div>

                    {/* Victory Modal */}
                    {gameState === 'VICTORY' && (
                        <div className="l2-victory-overlay">
                            <div className="l2-victory-box">
                                <div className="l2-victory-icon">🗝️</div>
                                <h1 className="l2-victory-title">CHINH PHỤC ĐƯỜNG XOÁY ỐC CHÂN LÝ</h1>
                                <p className="l2-victory-msg">
                                    Xuất sắc! Bạn đã vượt qua các <em>Cạm bẫy Siêu hình</em>, tích lũy đủ <em>Lượng</em>, 
                                    tạo nên những <em>Bước Nhảy về Chất</em> và nhận được <strong>Chìa Khóa Bước Nhảy</strong> mở lối vào Nhánh 3!
                                </p>
                                <div className="l2-victory-stats">
                                    <span>Tinh Thể Thu Thập: <strong>{collectedGems}/3 💎</strong></span>
                                    <span>Độ Cao Đạt Được: <strong>100% 🏆</strong></span>
                                </div>
                                <button className="l2-finish-btn" onClick={handleExit}>
                                    🗝️ NHẬN CHÌA KHÓA BƯỚC NHẢY & TIẾP TỤC
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Level2Minigame;
