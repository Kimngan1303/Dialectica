import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Level3Minigame.css';
import { useGameStore } from '../../store/useGameStore.js';
import { startEndingAudio } from './EndingSlideshow.jsx';
import { playGameSfx } from '../audio/AmbientAudio.jsx';

// Directions: 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT
const DIR_DELTA = [
    { dr: -1, dc: 0 }, // 0: UP
    { dr: 0, dc: 1 },  // 1: RIGHT
    { dr: 1, dc: 0 },  // 2: DOWN
    { dr: 0, dc: -1 }, // 3: LEFT
];

function getConnections(type, rotation) {
    const rotSteps = Math.floor(rotation / 90) % 4;
    let base = [];
    if (type === 'line') base = [0, 2];
    else if (type === 'corner') base = [0, 1];
    else if (type === 't_junction') base = [3, 0, 1];
    else if (type === 'cross') base = [0, 1, 2, 3];
    else if (type === 'source') base = [0, 1, 2, 3];
    else if (type === 'checkpoint') base = [0, 1, 2, 3];
    else if (type === 'target') base = [0, 1, 2, 3];
    else return [];

    if (['source', 'target', 'checkpoint', 'cross'].includes(type)) {
        return base;
    }
    return base.map(dir => (dir + rotSteps) % 4);
}

// LEVEL DEFINITIONS
const STAGES = [
    {
        stageNumber: 1,
        title: 'GIAI ĐOẠN 01: TRỰC QUAN SINH ĐỘNG (CẢM TÍNH)',
        kicker: 'NHẬN THỨC CẢM TÍNH',
        doctrine: '"Nhận thức bắt đầu từ trực quan sinh động — cảm giác, tri giác và biểu tượng tiếp xúc trực tiếp với thế giới khách quan."',
        rows: 4,
        cols: 4,
        gridConfig: [
            // Row 0
            { r: 0, c: 0, type: 'source', name: 'THỰC TẠI KHÁCH QUAN', solRot: 0 },
            { r: 0, c: 1, type: 'corner', solRot: 180 }, // connects 3 (left to 0,0) and 2 (down to 1,1)
            { r: 0, c: 2, type: 'line', solRot: 90 },
            { r: 0, c: 3, type: 'corner', solRot: 180 },

            // Row 1
            { r: 1, c: 0, type: 'line', solRot: 0 },
            { r: 1, c: 1, type: 'line', solRot: 0 }, // connects 0 (up to 0,1) and 2 (down to 2,1)
            { r: 1, c: 2, type: 'corner', solRot: 0 },
            { r: 1, c: 3, type: 'line', solRot: 0 },

            // Row 2
            { r: 2, c: 0, type: 'corner', solRot: 0 },
            { r: 2, c: 1, type: 'corner', solRot: 0 }, // connects 0 (up to 1,1) and 1 (right to 2,2)
            { r: 2, c: 2, type: 'corner', solRot: 180 }, // connects 3 (left to 2,1) and 2 (down to 3,2)
            { r: 2, c: 3, type: 'line', solRot: 0 },

            // Row 3
            { r: 3, c: 0, type: 'line', solRot: 90 },
            { r: 3, c: 1, type: 'line', solRot: 90 },
            { r: 3, c: 2, type: 'corner', solRot: 0 }, // connects 0 (up to 2,2) and 1 (right to 3,3)
            { r: 3, c: 3, type: 'target', name: 'ĐÀI CẢM TÍNH', solRot: 0 }
        ]
    },
    {
        stageNumber: 2,
        title: 'GIAI ĐOẠN 02: TƯ DUY TRỪU TƯỢNG (LÝ TÍNH)',
        kicker: 'NHẬN THỨC LÝ TÍNH',
        doctrine: '"Từ trực quan sinh động chuyển hóa lên tư duy trừu tượng — khái quát hóa bản chất và quy luật bằng Khái niệm, Phán đoán, Suy lý."',
        rows: 4,
        cols: 5,
        gridConfig: [
            // Row 0
            { r: 0, c: 0, type: 'source', name: 'NGUỒN CẢM TÍNH', solRot: 0 },
            { r: 0, c: 1, type: 'line', solRot: 90 }, // connects 3 (left to 0,0) and 1 (right to 0,2)
            { r: 0, c: 2, type: 'corner', solRot: 180 }, // connects 3 (left to 0,1) and 2 (down to 1,2)
            { r: 0, c: 3, type: 'corner', solRot: 180 },
            { r: 0, c: 4, type: 'line', solRot: 0 },

            // Row 1
            { r: 1, c: 0, type: 'line', solRot: 0 },
            { r: 1, c: 1, type: 'block', name: 'SIÊU HÌNH XƠ CỨNG', solRot: 0 },
            { r: 1, c: 2, type: 'line', solRot: 0 }, // connects 0 (up to 0,2) and 2 (down to 2,2)
            { r: 1, c: 3, type: 'corner', solRot: 0 },
            { r: 1, c: 4, type: 'line', solRot: 0 },

            // Row 2
            { r: 2, c: 0, type: 'corner', solRot: 0 },
            { r: 2, c: 1, type: 'checkpoint', name: 'KHÁI NIỆM & PHÁN ĐOÁN', solRot: 0 },
            { r: 2, c: 2, type: 't_junction', solRot: 0 }, // connects 3 (left to CP 2,1), 0 (up to 1,2), 1 (right to 2,3)
            { r: 2, c: 3, type: 'corner', solRot: 180 }, // connects 3 (left to 2,2) and 2 (down to 3,3)
            { r: 2, c: 4, type: 'block', name: 'CHỦ NGHĨA GIÁO ĐIỀU', solRot: 0 },

            // Row 3
            { r: 3, c: 0, type: 'line', solRot: 90 },
            { r: 3, c: 1, type: 'corner', solRot: 270 },
            { r: 3, c: 2, type: 'line', solRot: 90 },
            { r: 3, c: 3, type: 'corner', solRot: 0 }, // connects 0 (up to 2,3) and 1 (right to target 3,4)
            { r: 3, c: 4, type: 'target', name: 'TRỤ NƠ-RON LÝ TÍNH', solRot: 0 }
        ]
    },
    {
        stageNumber: 3,
        title: 'GIAI ĐOẠN 03: THỰC TIỄN & CHÂN LÝ TỐI THƯỢNG',
        kicker: 'HỢP NHẤT BIỆN CHỨNG',
        doctrine: '"Thực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn khách quan duy nhất để kiểm tra Chân lý."',
        rows: 5,
        cols: 5,
        gridConfig: [
            // Row 0
            { r: 0, c: 0, type: 'source', name: 'LÝ LUẬN BIỆN CHỨNG', solRot: 0 },
            { r: 0, c: 1, type: 'line', solRot: 90 }, // left-right
            { r: 0, c: 2, type: 'line', solRot: 90 }, // left-right
            { r: 0, c: 3, type: 'corner', solRot: 180 }, // connects 3 (left to 0,2) and 2 (down to 1,3)
            { r: 0, c: 4, type: 'corner', solRot: 180 },

            // Row 1
            { r: 1, c: 0, type: 'corner', solRot: 0 },
            { r: 1, c: 1, type: 'block', name: 'BẤT KHẢ TRI LUẬN', solRot: 0 },
            { r: 1, c: 2, type: 'line', solRot: 0 },
            { r: 1, c: 3, type: 'checkpoint', name: 'KIỂM CHỨNG THỰC NGHIỆM', solRot: 0 },
            { r: 1, c: 4, type: 'line', solRot: 0 },

            // Row 2
            { r: 2, c: 0, type: 'corner', solRot: 90 },
            { r: 2, c: 1, type: 'corner', solRot: 90 }, // connects 1 (right to 2,2) and 2 (down to 3,1)
            { r: 2, c: 2, type: 'line', solRot: 90 }, // connects 1 (right to 2,3) and 3 (left to 2,1)
            { r: 2, c: 3, type: 'corner', solRot: 270 }, // connects 0 (up to 1,3) and 3 (left to 2,2)
            { r: 2, c: 4, type: 'line', solRot: 0 },

            // Row 3
            { r: 3, c: 0, type: 'line', solRot: 0 },
            { r: 3, c: 1, type: 'checkpoint', name: 'CẢI TẠO THẾ GIỚI', solRot: 0 },
            { r: 3, c: 2, type: 'corner', solRot: 270 },
            { r: 3, c: 3, type: 'block', name: 'CHỦ NGHĨA DUY TÂM', solRot: 0 },
            { r: 3, c: 4, type: 'line', solRot: 0 },

            // Row 4
            { r: 4, c: 0, type: 'corner', solRot: 0 },
            { r: 4, c: 1, type: 'corner', solRot: 0 }, // connects 0 (up to 3,1) and 1 (right to 4,2)
            { r: 4, c: 2, type: 'line', solRot: 90 }, // left-right
            { r: 4, c: 3, type: 'line', solRot: 90 }, // left-right
            { r: 4, c: 4, type: 'target', name: 'LÕI CHÂN LÝ TỐI THƯỢNG', solRot: 0 }
        ]
    }
];

// SVG Drawing of a tile wire
const TileRenderer = ({ cell, isPowered, isHinted, onClick }) => {
    const { type, rotation, name } = cell;

    return (
        <div 
            className={`l3-circuit-tile ${type === 'block' ? 'block-tile locked' : ''} ${isPowered ? 'powered' : ''} ${isHinted ? 'hint-highlight' : ''}`}
            onClick={onClick}
            title={name || type}
            role="button"
            tabIndex={0}
            style={{ pointerEvents: 'auto' }}
        >
            <svg viewBox="0 0 100 100" className="l3-tile-svg" style={{ transform: `rotate(${rotation}deg)`, pointerEvents: 'none' }}>
                <defs>
                    <filter id="wire-glow">
                        <feGaussianBlur stdDeviation="4" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Background base plate pattern */}
                <rect x="5" y="5" width="90" height="90" rx="8" fill="#130407" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="1.5" />

                {/* Wire lines based on piece type (at rotation 0) */}
                {type === 'line' && (
                    <g>
                        <line x1="50" y1="0" x2="50" y2="100" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="12" strokeLinecap="round" />
                        {isPowered && <line x1="50" y1="0" x2="50" y2="100" stroke="#fff" strokeWidth="4" filter="url(#wire-glow)" />}
                    </g>
                )}

                {type === 'corner' && (
                    <g>
                        <path d="M 50 0 L 50 50 L 100 50" fill="none" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                        {isPowered && <path d="M 50 0 L 50 50 L 100 50" fill="none" stroke="#fff" strokeWidth="4" filter="url(#wire-glow)" />}
                    </g>
                )}

                {type === 't_junction' && (
                    <g>
                        <path d="M 0 50 L 100 50 M 50 50 L 50 0" fill="none" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="12" strokeLinecap="round" />
                        {isPowered && <path d="M 0 50 L 100 50 M 50 50 L 50 0" fill="none" stroke="#fff" strokeWidth="4" filter="url(#wire-glow)" />}
                    </g>
                )}

                {type === 'cross' && (
                    <g>
                        <line x1="0" y1="50" x2="100" y2="50" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="12" strokeLinecap="round" />
                        <line x1="50" y1="0" x2="50" y2="100" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="12" strokeLinecap="round" />
                        {isPowered && (
                            <>
                                <line x1="0" y1="50" x2="100" y2="50" stroke="#fff" strokeWidth="4" filter="url(#wire-glow)" />
                                <line x1="50" y1="0" x2="50" y2="100" stroke="#fff" strokeWidth="4" filter="url(#wire-glow)" />
                            </>
                        )}
                    </g>
                )}

                {type === 'source' && (
                    <g>
                        <line x1="50" y1="50" x2="100" y2="50" stroke="#f59e0b" strokeWidth="12" />
                        <line x1="50" y1="50" x2="50" y2="100" stroke="#f59e0b" strokeWidth="12" />
                        <circle cx="50" cy="50" r="30" fill="#24070a" stroke="#fbbf24" strokeWidth="3" />
                        <circle cx="50" cy="50" r="20" fill="#f59e0b" filter="url(#wire-glow)" />
                        <circle cx="50" cy="50" r="8" fill="#fff" />
                    </g>
                )}

                {type === 'checkpoint' && (
                    <g>
                        <line x1="0" y1="50" x2="100" y2="50" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="10" />
                        <line x1="50" y1="0" x2="50" y2="100" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="10" />
                        <rect x="25" y="25" width="50" height="50" rx="8" fill="#1b080d" stroke={isPowered ? '#fbbf24' : '#78350f'} strokeWidth="2.5" />
                        <circle cx="50" cy="50" r="16" fill={isPowered ? '#f59e0b' : '#33080e'} filter={isPowered ? 'url(#wire-glow)' : 'none'} />
                        <text x="50" y="54" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">✦</text>
                    </g>
                )}

                {type === 'target' && (
                    <g>
                        <line x1="0" y1="50" x2="50" y2="50" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="10" />
                        <line x1="50" y1="0" x2="50" y2="50" stroke={isPowered ? '#f59e0b' : '#451a03'} strokeWidth="10" />
                        <circle cx="50" cy="50" r="34" fill="#1f080e" stroke={isPowered ? '#ef4444' : '#78350f'} strokeWidth="3" />
                        <circle cx="50" cy="50" r="22" fill={isPowered ? '#ef4444' : '#2a090f'} filter={isPowered ? 'url(#wire-glow)' : 'none'} />
                        <circle cx="50" cy="50" r="10" fill={isPowered ? '#fff' : '#b45309'} />
                    </g>
                )}

                {type === 'block' && (
                    <g>
                        <rect x="15" y="15" width="70" height="70" rx="6" fill="#100305" stroke="#7f1d1d" strokeWidth="2" />
                        <line x1="25" y1="25" x2="75" y2="75" stroke="#ef4444" strokeWidth="3" />
                        <line x1="75" y1="25" x2="25" y2="75" stroke="#ef4444" strokeWidth="3" />
                    </g>
                )}
            </svg>

            {name && <span className="l3-node-label">{name}</span>}
        </div>
    );
};

// Helper to initialize grid for a given stage
const createStageGrid = (stageIdx) => {
    const stage = STAGES[stageIdx] || STAGES[0];
    const newGrid = [];

    for (let r = 0; r < stage.rows; r++) {
        const row = [];
        for (let c = 0; c < stage.cols; c++) {
            const config = stage.gridConfig.find(item => item.r === r && item.c === c) || { type: 'line', solRot: 0 };
            let initialRot = config.solRot;
            if (!['source', 'target', 'checkpoint', 'block'].includes(config.type)) {
                const offsets = [90, 180, 270];
                const randomOffset = offsets[Math.floor(Math.random() * offsets.length)];
                initialRot = (config.solRot + randomOffset) % 360;
            }
            row.push({
                r,
                c,
                type: config.type,
                name: config.name || '',
                rotation: initialRot,
                solRot: config.solRot
            });
        }
        newGrid.push(row);
    }
    return newGrid;
};

export default function Level3Minigame() {
    const { setViewState } = useGameStore();

    const [currentStageIdx, setCurrentStageIdx] = useState(0);
    const [grid, setGrid] = useState(() => createStageGrid(0));
    const [hintCell, setHintCell] = useState(null);
    const [moves, setMoves] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isUltimateVictory, setIsUltimateVictory] = useState(false);

    const currentStage = STAGES[currentStageIdx] || STAGES[0];

    // Synchronously switch stage to avoid dimension mismatches
    const switchStage = useCallback((stageIdx) => {
        if (stageIdx < 0 || stageIdx >= STAGES.length) return;
        setCurrentStageIdx(stageIdx);
        setGrid(createStageGrid(stageIdx));
        setHintCell(null);
        setShowModal(false);
        setMoves(0);
    }, []);

    // Reset current stage
    const resetCurrentStage = useCallback(() => {
        setGrid(createStageGrid(currentStageIdx));
        setHintCell(null);
        setShowModal(false);
        setMoves(0);
    }, [currentStageIdx]);

    // Calculate Powered Grid via BFS
    const poweredGrid = useMemo(() => {
        if (!grid || !grid.length) return [];
        // Guard against any desynchronization when stage changes
        if (grid.length !== currentStage.rows || !grid[0] || grid[0].length !== currentStage.cols) {
            return [];
        }
        const rows = currentStage.rows;
        const cols = currentStage.cols;
        const powered = Array.from({ length: rows }, () => Array(cols).fill(false));
        const queue = [];

        // Find source
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r]?.[c];
                if (cell && cell.type === 'source') {
                    powered[r][c] = true;
                    queue.push({ r, c });
                }
            }
        }

        while (queue.length > 0) {
            const { r, c } = queue.shift();
            const cell = grid[r]?.[c];
            if (!cell) continue;

            const connections = getConnections(cell.type, cell.rotation);

            for (const dir of connections) {
                const nr = r + DIR_DELTA[dir].dr;
                const nc = c + DIR_DELTA[dir].dc;

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    if (!powered[nr][nc]) {
                        const neighbor = grid[nr]?.[nc];
                        if (!neighbor || neighbor.type === 'block') continue;

                        const neighborConnections = getConnections(neighbor.type, neighbor.rotation);
                        const requiredOpposite = (dir + 2) % 4;

                        if (neighborConnections.includes(requiredOpposite)) {
                            powered[nr][nc] = true;
                            queue.push({ r: nr, c: nc });
                        }
                    }
                }
            }
        }

        return powered;
    }, [grid, currentStage]);

    // Check Victory Condition
    useEffect(() => {
        if (!grid || !grid.length || !poweredGrid || !poweredGrid.length || showModal) return;
        if (grid.length !== currentStage.rows || !grid[0] || grid[0].length !== currentStage.cols) return;

        let targetPowered = false;
        let allCheckpointsPowered = true;

        for (let r = 0; r < currentStage.rows; r++) {
            for (let c = 0; c < currentStage.cols; c++) {
                const cell = grid[r]?.[c];
                if (!cell) continue;
                if (cell.type === 'target' && poweredGrid[r]?.[c]) {
                    targetPowered = true;
                }
                if (cell.type === 'checkpoint' && !poweredGrid[r]?.[c]) {
                    allCheckpointsPowered = false;
                }
            }
        }

        if (targetPowered && allCheckpointsPowered) {
            if (currentStageIdx < STAGES.length - 1) {
                playGameSfx('correct');
                setShowModal(true);
            } else {
                playGameSfx('purify');
                setIsUltimateVictory(true);
                setShowModal(true);
            }
        }
    }, [poweredGrid, grid, currentStage, currentStageIdx, showModal]);

    // Rotate Tile on Click
    const handleTileClick = (r, c) => {
        const cell = grid[r]?.[c];
        if (!cell || ['source', 'target', 'checkpoint', 'block'].includes(cell.type)) return;

        playGameSfx('click');
        setGrid(prev => {
            const next = prev.map(row => row.map(item => ({ ...item })));
            if (next[r]?.[c]) {
                next[r][c].rotation = (next[r][c].rotation + 90) % 360;
            }
            return next;
        });
        setMoves(m => m + 1);

        if (hintCell && hintCell.r === r && hintCell.c === c) {
            setHintCell(null);
        }
    };

    // Hint Function: Rotates one incorrect tile along solution and highlights it
    const handleHint = () => {
        if (grid.length !== currentStage.rows || !grid[0] || grid[0].length !== currentStage.cols) return;
        for (let r = 0; r < currentStage.rows; r++) {
            for (let c = 0; c < currentStage.cols; c++) {
                const cell = grid[r]?.[c];
                if (!cell) continue;
                if (!['source', 'target', 'checkpoint', 'block'].includes(cell.type)) {
                    const isLine = cell.type === 'line';
                    const isSolved = isLine
                        ? (cell.rotation % 180) === (cell.solRot % 180)
                        : (cell.rotation % 360) === (cell.solRot % 360);

                    if (!isSolved) {
                        setHintCell({ r, c });
                        playGameSfx('craft');
                        // Auto-correct this tile
                        setGrid(prev => {
                            const next = prev.map(row => row.map(item => ({ ...item })));
                            if (next[r]?.[c]) {
                                next[r][c].rotation = cell.solRot;
                            }
                            return next;
                        });
                        return;
                    }
                }
            }
        }
    };

    const handleNextStage = () => {
        switchStage(currentStageIdx + 1);
    };

    const handleCompleteGame = () => {
        startEndingAudio();
        setViewState('ENDING');
    };

    return (
        <div className="l3-circuit-container" style={{ pointerEvents: 'auto' }}>
            <div className="l3-circuit-board-wrapper" style={{ pointerEvents: 'auto' }}>
                {/* Header */}
                <div className="l3-circuit-header">
                    <div className="l3-philosopher-badge">
                        <img src="/level3/marx.jpg" alt="Karl Marx" className="l3-badge-img" />
                        <div className="l3-badge-text">
                            <h4>C. MÁC</h4>
                            <p>Quy luật Thực tiễn</p>
                        </div>
                    </div>

                    <div className="l3-circuit-title-area">
                        <p className="l3-circuit-kicker">{currentStage.kicker}</p>
                        <h2 className="l3-circuit-main-title">GHÉP NỐI MẠCH NĂNG LƯỢNG CHÂN LÝ</h2>
                    </div>

                    <div className="l3-philosopher-badge">
                        <div className="l3-badge-text" style={{ textAlign: 'right' }}>
                            <h4>V.I. LÊNIN</h4>
                            <p>Con đường Nhận thức</p>
                        </div>
                        <img src="/level3/lenin.jpg" alt="V.I. Lenin" className="l3-badge-img" />
                    </div>

                    {/* Exit Button */}
                    <button 
                        className="l3-exit-hub-btn" 
                        onClick={() => setViewState('HUB')}
                        title="Trở về vũ trụ HUB"
                    >
                        ✕ THOÁT RA HUB
                    </button>
                </div>

                {/* Stage Stepper - Clickable tabs */}
                <div className="l3-stage-stepper">
                    {STAGES.map((st, i) => (
                        <button 
                            key={i} 
                            type="button"
                            onClick={() => {
                                playGameSfx('click');
                                switchStage(i);
                            }}
                            className={`l3-step-chip ${i === currentStageIdx ? 'active' : ''} ${i < currentStageIdx ? 'completed' : ''}`}
                            title={`Chuyển trực tiếp sang Ải ${st.stageNumber}: ${st.kicker}`}
                        >
                            {i < currentStageIdx ? '✓ ' : ''}ẢI {st.stageNumber}: {st.kicker}
                        </button>
                    ))}
                </div>

                {/* Doctrine Quote */}
                <div className="l3-doctrine-banner">
                    {currentStage.doctrine}
                </div>

                {/* Grid Arena */}
                <div 
                    className="l3-grid-arena"
                    style={{
                        gridTemplateColumns: `repeat(${currentStage.cols}, 82px)`,
                        gridTemplateRows: `repeat(${currentStage.rows}, 82px)`,
                        pointerEvents: 'auto'
                    }}
                >
                    {grid.map((row, r) => 
                        row.map((cell, c) => (
                            <TileRenderer
                                key={`${currentStageIdx}-${r}-${c}`}
                                cell={cell}
                                isPowered={poweredGrid[r] && poweredGrid[r][c]}
                                isHinted={hintCell && hintCell.r === r && hintCell.c === c}
                                onClick={() => handleTileClick(r, c)}
                            />
                        ))
                    )}
                </div>

                {/* Controls & Footer */}
                <div className="l3-circuit-controls">
                    <div className="l3-stats-info">
                        <span>Số lần xoay: <strong>{moves}</strong></span>
                        <span>Mục tiêu: <strong>Nhấp vào các ống dẫn để xoay kết nối dòng điện</strong></span>
                    </div>

                    <div className="l3-btn-group">
                        <button className="l3-control-btn hint-btn" onClick={handleHint}>
                            💡 GỢI Ý XOAY
                        </button>
                        <button className="l3-control-btn" onClick={resetCurrentStage}>
                            🔄 ĐẶT LẠI ẢI
                        </button>
                    </div>
                </div>

                {/* Victory Modal */}
                {showModal && (
                    <div className="l3-victory-modal-overlay">
                        <div className="l3-victory-modal-box">
                            <div className="l3-modal-icon">{isUltimateVictory ? '👑' : '⚡'}</div>
                            <h3 className="l3-modal-title">
                                {isUltimateVictory ? 'CHÂN LÝ TỐI THƯỢNG ĐÃ KHAI MỞ!' : 'THÔNG SUỐT MẠCH NHẬN THỨC!'}
                            </h3>
                            <p className="l3-modal-desc">
                                {isUltimateVictory 
                                    ? 'Xuất sắc! Dòng năng lượng đã đi trọn vẹn từ Thực tại khách quan qua Trực quan sinh động, Tư duy trừu tượng và được kiểm chứng hoàn hảo bởi Thực tiễn! Bạn đã hoàn thành toàn bộ chương trình Triết học Mác - Lênin!'
                                    : `Chúc mừng bạn đã hoàn thành Ải ${currentStage.stageNumber}. Năng lượng nhận thức đã thông suốt và sẵn sàng nâng lên giai đoạn biện chứng tiếp theo!`
                                }
                            </p>
                            {isUltimateVictory ? (
                                <button className="l3-modal-action-btn" onClick={handleCompleteGame}>
                                    🏆 TIẾN VÀO CUNG ĐIỆN CHÂN LÝ & XEM KẾT THÚC
                                </button>
                            ) : (
                                <button className="l3-modal-action-btn" onClick={handleNextStage}>
                                    TIẾP TỤC SANG ẢI {currentStageIdx + 2} ➔
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
