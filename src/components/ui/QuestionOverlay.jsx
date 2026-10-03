import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import questionsData from '../../data/questions.json';
import { playGameSfx } from '../audio/AmbientAudio';

// --- Branch 2 RPG Minigame Component ---
// --- Branch 2: Cán Cân Chân Lý Biện Chứng (Dialectical Balance of Truth) ---
const RPGMinigame = ({ question, onWin, onLose }) => {
  const arenaWidth = 800;
  const arenaHeight = 500;
  
  const [playerPos, setPlayerPos] = useState({ x: 400, y: 350 });
  const [carryingIdx, setCarryingIdx] = useState(null);
  const [readingIdx, setReadingIdx] = useState(null);
  
  const playerRef = useRef({ x: 400, y: 350 });
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const reqRef = useRef(null);

  const speed = 4.5;
  const interactRadius = 85;
  
  const triggeredRef = useRef(false);
  const itemsRef = useRef([]);
  const readingIdxRef = useRef(null);
  
  useEffect(() => {
    readingIdxRef.current = readingIdx;
  }, [readingIdx]);

  useEffect(() => {
    const fixedSpawns = [
      { x: 180, y: 150 },
      { x: 620, y: 150 },
      { x: 180, y: 380 },
      { x: 620, y: 380 }
    ];

    const generatedItems = question.options.map((opt, i) => ({
      idx: i,
      label: String.fromCharCode(65 + i),
      text: opt,
      x: fixedSpawns[i].x,
      y: fixedSpawns[i].y,
      color: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : i === 2 ? '#eab308' : '#fbbf24'
    }));
    itemsRef.current = generatedItems;
  }, [question]);

  const items = itemsRef.current;
  const balanceScalePos = { x: 400, y: 220 }; // Trung tâm đấu trường

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (key === 'w' || key === 'arrowup') keysRef.current.w = true;
        if (key === 's' || key === 'arrowdown') keysRef.current.s = true;
        if (key === 'a' || key === 'arrowleft') keysRef.current.a = true;
        if (key === 'd' || key === 'arrowright') keysRef.current.d = true;
      }
      if (key === 'f') handleF();
      if (key === 'j' || key === 'enter' || key === ' ') handleJ();
    };
    
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keysRef.current.w = false;
      if (key === 's' || key === 'arrowdown') keysRef.current.s = false;
      if (key === 'a' || key === 'arrowleft') keysRef.current.a = false;
      if (key === 'd' || key === 'arrowright') keysRef.current.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); 

  const handleF = () => {
    playGameSfx('navigate');
    setReadingIdx(prev => {
      if (prev !== null) return null; 
      let closest = null;
      let minDist = interactRadius;
      itemsRef.current.forEach(item => {
        const d = Math.hypot(playerRef.current.x - item.x, playerRef.current.y - item.y);
        if (d < minDist) {
          minDist = d;
          closest = item.idx;
        }
      });
      return closest;
    });
  };

  const handleJ = () => {
    playGameSfx('pickup');
    setCarryingIdx(prev => {
      if (prev !== null) return null; 
      let closest = null;
      let minDist = interactRadius;
      itemsRef.current.forEach(item => {
        const d = Math.hypot(playerRef.current.x - item.x, playerRef.current.y - item.y);
        if (d < minDist) {
          minDist = d;
          closest = item.idx;
        }
      });
      if (closest !== null) setReadingIdx(null); 
      return closest;
    });
  };

  // Game Loop di chuyển mượt mà
  useEffect(() => {
    const update = () => {
      if (readingIdxRef.current === null) {
        let dx = 0;
        let dy = 0;
        if (keysRef.current.w) dy -= speed;
        if (keysRef.current.s) dy += speed;
        if (keysRef.current.a) dx -= speed;
        if (keysRef.current.d) dx += speed;

        if (dx !== 0 || dy !== 0) {
          setPlayerPos(prev => {
            let nx = prev.x + dx;
            let ny = prev.y + dy;
            nx = Math.max(30, Math.min(arenaWidth - 30, nx));
            ny = Math.max(40, Math.min(arenaHeight - 40, ny));
            playerRef.current = { x: nx, y: ny };
            return playerRef.current;
          });
        }
      }
      reqRef.current = requestAnimationFrame(update);
    };
    reqRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(reqRef.current);
  }, []);

  // Kiểm tra đặt ngọc lên Cán Cân Chân Lý
  useEffect(() => {
    if (triggeredRef.current) return;
    
    const distToScale = Math.hypot(playerPos.x - balanceScalePos.x, playerPos.y - balanceScalePos.y);
    if (distToScale < 65 && carryingIdx !== null) {
      if (carryingIdx === question.correctAnswerIndex) {
        triggeredRef.current = true;
        onWin();
      } else {
        triggeredRef.current = true;
        onLose();
      }
    }
  }, [playerPos, carryingIdx, question, onWin, onLose]);

  let promptText = "";
  if (readingIdx !== null) {
    // Đang xem luận điểm
  } else if (carryingIdx !== null) {
    promptText = "⚡ Đang giữ Ngọc Luận Điểm. Hãy mang đến BỆ CÂN BẰNG ở giữa! [J / Phím Cách để thả]";
  } else {
    let isNear = false;
    itemsRef.current.forEach(item => {
      if (Math.hypot(playerPos.x - item.x, playerPos.y - item.y) < interactRadius) isNear = true;
    });
    if (isNear) {
      promptText = "✦ [F] Đọc Luận Điểm | [J / Phím Cách] Nhặt Ngọc Luận Điểm ✦";
    }
  }

  return (
    <div style={{
      position: 'relative',
      width: arenaWidth + 'px',
      height: arenaHeight + 'px',
      margin: '0 auto',
      background: 'radial-gradient(circle at 50% 50%, #200a12 0%, #0d0407 100%)',
      border: '2px solid rgba(251, 191, 36, 0.45)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 0 40px rgba(239, 68, 68, 0.25) inset, 0 10px 30px rgba(0,0,0,0.8)'
    }}>
      
      {/* HUD Info */}
      <div style={{ position: 'absolute', top: '12px', left: '16px', color: '#fbbf24', fontSize: '13px', fontWeight: 'bold', zIndex: 10 }}>
        🎮 Dùng W, A, S, D hoặc Mũi Tên để di chuyển | [F] Đọc | [J] Nhặt
      </div>

      {/* Prompt UI */}
      {promptText && (
        <div style={{
          position: 'absolute', top: '45px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(24, 9, 15, 0.92)', border: '1px solid #fbbf24',
          color: '#fef08a', padding: '8px 20px', borderRadius: '30px', fontWeight: 'bold',
          fontSize: '13px', zIndex: 20, boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
        }}>
          {promptText}
        </div>
      )}

      {/* Reading Panel */}
      <AnimatePresence>
        {readingIdx !== null && itemsRef.current[readingIdx] && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              background: 'rgba(10, 3, 6, 0.85)', backdropFilter: 'blur(8px)',
              zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
               style={{
                 background: 'linear-gradient(135deg, rgba(28, 10, 16, 0.95), rgba(18, 6, 10, 0.98))',
                 border: `2px solid #fbbf24`,
                 borderRadius: '24px',
                 padding: '36px',
                 width: '75%',
                 textAlign: 'center',
                 boxShadow: '0 0 40px rgba(245, 158, 11, 0.35)'
               }}
            >
              <div className="badge px-3 py-2 mb-3" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)', color: '#fff', fontSize: '15px' }}>
                LUẬN ĐIỂM {itemsRef.current[readingIdx].label}
              </div>
              <div className="fs-4 my-4 lh-lg mx-auto text-white" style={{ maxWidth: '90%', fontWeight: '500' }}>
                {itemsRef.current[readingIdx].text}
              </div>
              <div className="mt-4 d-flex gap-4 justify-content-center">
                <Button variant="outline-light" size="lg" onClick={handleF} className="fw-bold px-4 py-2 rounded-pill" style={{ borderColor: 'rgba(251, 191, 36, 0.4)', color: '#fef08a' }}>
                  Đóng lại [F]
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleJ} 
                  className="fw-bold px-4 py-2 rounded-pill text-dark"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: 'none', boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}
                >
                  ⚡ Nhặt Ngọc Luận Điểm [J]
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CÁN CÂN CHÂN LÝ BIỆN CHỨNG (Bệ Cân Ở Trung Tâm) */}
      <div style={{
        position: 'absolute',
        top: balanceScalePos.y - 48,
        left: balanceScalePos.x - 48,
        width: '96px', height: '96px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(239, 68, 68, 0.1) 70%, transparent 100%)',
        border: '2px dashed rgba(251, 191, 36, 0.6)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 25px rgba(245, 158, 11, 0.35)',
        animation: 'pulseScale 2.5s infinite ease-in-out'
      }}>
        <span style={{ fontSize: '38px', filter: 'drop-shadow(0 0 10px #fbbf24)' }}>⚖️</span>
        <span style={{ fontSize: '10px', color: '#fef08a', fontWeight: 'bold', letterSpacing: '1px', marginTop: '2px' }}>
          CÁN CÂN CHÂN LÝ
        </span>
      </div>

      {/* 4 Viên Ngọc Luận Điểm trên sàn */}
      {items.map(item => {
        if (carryingIdx === item.idx) return null;
        return (
          <div
            key={item.idx}
            onClick={() => {
              const d = Math.hypot(playerRef.current.x - item.x, playerRef.current.y - item.y);
              if (d < interactRadius) setReadingIdx(item.idx);
            }}
            style={{
              position: 'absolute',
              top: item.y - 28,
              left: item.x - 28,
              width: '56px', height: '56px',
              backgroundColor: 'rgba(28, 10, 16, 0.85)',
              border: `2px solid ${item.color}`,
              boxShadow: `0 0 20px ${item.color}80`,
              borderRadius: '50%',
              animation: 'floatOrb 2.5s infinite ease-in-out',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer',
              zIndex: 4
            }}
          >
            <span>{item.label}</span>
          </div>
        );
      })}

      {/* Người Chơi: Linh Hồn Nhận Thức */}
      <div
        style={{
          position: 'absolute',
          top: playerPos.y - 24,
          left: playerPos.x - 24,
          width: '48px', height: '48px',
          backgroundColor: 'rgba(251, 191, 36, 0.2)',
          border: '2px solid #fbbf24',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(239, 68, 68, 0.4)',
          zIndex: 6,
          fontSize: '24px'
        }}
      >
        🧘
        {/* Viên ngọc đang bế trên tay */}
        {carryingIdx !== null && (
          <div style={{
            position: 'absolute',
            top: '-24px',
            width: '28px', height: '28px',
            backgroundColor: items[carryingIdx].color,
            boxShadow: `0 0 15px ${items[carryingIdx].color}`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontSize: '12px', fontWeight: '900'
          }}>
            {items[carryingIdx].label}
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatOrb {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); border-color: rgba(251, 191, 36, 0.6); }
          50% { transform: scale(1.06); border-color: #ef4444; }
        }
      `}</style>
    </div>
  );
};

// --- Main Question Overlay ---
const QuestionOverlay = () => {
  const { 
    activeNodeId, 
    viewState, 
    setViewState, 
    currentBranch,
    answerQuestion,
    setRewardPopup
  } = useGameStore();

  const [answeredState, setAnsweredState] = useState(null); // 'correct', 'wrong', null
  const answeringRef = useRef(false); // Guard chống double-click nhanh

  // Reset trạng thái khi mở câu hỏi mới (tránh hiển thị đáp án cũ)
  useEffect(() => {
    setAnsweredState(null);
    answeringRef.current = false;
  }, [activeNodeId]);

  if (viewState !== 'QUESTION' || activeNodeId === null) return null;

  const question = questionsData[activeNodeId];
  if (!question) return null;

  const triggerWin = () => {
    playGameSfx('correct');
    setAnsweredState('correct');
    answerQuestion(question.id, true);

    setTimeout(() => {
      if (question.rewardItemId) {
        const itemDef = {
          id: question.rewardItemId,
          name: question.rewardItemId === 'stone' ? 'Bản thể Khách quan' :
                question.rewardItemId === 'mirror' ? 'Gương Phản ánh Tư duy' :
                question.rewardItemId === 'water' ? 'Dòng chảy Biến dịch' :
                question.rewardItemId === 'fire' ? 'Ngọn lửa Biện chứng' :
                question.rewardItemId === 'rope' ? 'Sợi dây Mối liên hệ' :
                question.rewardItemId === 'gear' ? 'Bánh răng Quy luật' : 'Khế ước Thực tiễn',
          icon: question.rewardItemId === 'stone' ? '💎' :
                question.rewardItemId === 'mirror' ? '🪞' :
                question.rewardItemId === 'water' ? '🌊' :
                question.rewardItemId === 'fire' ? '🔥' :
                question.rewardItemId === 'rope' ? '🎗️' :
                question.rewardItemId === 'gear' ? '⚙️' : '📜',
        };
        setRewardPopup(itemDef);
      } else {
        closeOverlay();
      }
    }, 1000);
  };

  const triggerLose = (exit = true) => {
    playGameSfx('wrong');
    setAnsweredState('wrong');
    if (currentBranch !== 'BOSS') {
      answerQuestion(question.id, false);
    }
    if (exit) {
      setTimeout(() => {
        closeOverlay();
      }, 1500);
    }
  };

  const handleStandardAnswer = (idx) => {
    if (answeredState || answeringRef.current) return;
    answeringRef.current = true;
    if (idx === question.correctAnswerIndex) {
      triggerWin();
    } else {
      triggerLose(true);
    }
  };

  const closeOverlay = () => {
    answeringRef.current = false;
    setAnsweredState(null);
    setViewState('BRANCH');
  };

  const isBranch2 = currentBranch == 2;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(11, 7, 9, 0.88)', backdropFilter: 'blur(12px)',
        zIndex: 40, display: 'flex', justifyContent: 'center', alignItems: 'center',
        pointerEvents: 'auto'
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-panel"
        style={{
          width: '900px', maxWidth: '95%', padding: '40px',
          borderRadius: '24px', border: '1px solid rgba(251, 191, 36, 0.45)',
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.25)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div className="d-flex justify-content-between mb-4 align-items-center">
          <span className="badge px-3 py-2 fs-6 fw-bold" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)', color: '#fff' }}>
            Nhánh {question.branchId}
          </span>
          <Button variant="outline-warning" size="sm" onClick={closeOverlay} className="rounded-pill px-3">
            <i className="bi bi-x-lg me-1"></i>Đóng
          </Button>
        </div>

        <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="mb-4 lh-base text-white text-center" style={{ fontSize: '24px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {question.text}
          </h3>
          
          {isBranch2 ? (
            <RPGMinigame question={question} onWin={triggerWin} onLose={triggerLose} />
          ) : (
            <div className="d-flex flex-column gap-3 mt-5">
              {question.options.map((opt, idx) => {
                const isCorrectAnswer = answeredState === 'correct' && idx === question.correctAnswerIndex;
                return (
                  <motion.div
                    key={idx}
                    animate={answeredState === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      variant={isCorrectAnswer ? 'warning' : 'outline-light'}
                      className={`w-100 text-start py-3 px-4 fs-5 ${isCorrectAnswer ? 'fw-bold' : ''}`}
                      onClick={() => handleStandardAnswer(idx)}
                      disabled={answeredState === 'correct'}
                      style={{ 
                        borderRadius: '16px', borderWidth: isCorrectAnswer ? '2px' : '1px',
                        color: isCorrectAnswer ? '#000' : '#fce7f3',
                        borderColor: isCorrectAnswer ? '#fbbf24' : 'rgba(251, 191, 36, 0.25)',
                        backgroundColor: isCorrectAnswer ? '#fbbf24' : 'rgba(30, 12, 18, 0.75)'
                      }}
                    >
                      <strong style={{ color: isCorrectAnswer ? '#000' : '#fbbf24', marginRight: '10px' }}>
                        {String.fromCharCode(65 + idx)}.
                      </strong> 
                      {opt}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {answeredState === 'correct' && !question.rewardItemId && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 text-center text-success fw-bold fs-4">
              ✨ Câu trả lời chính xác!
            </motion.div>
          )}

          {answeredState === 'wrong' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 text-center text-danger fw-bold fs-4">
              ❌ Sai rồi! {currentBranch === 'BOSS' ? 'Bạn có thể thử lại!' : 'Nơ-ron này đã bị khóa tạm thời.'}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionOverlay;
