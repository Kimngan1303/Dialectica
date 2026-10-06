import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import questionsData from '../../data/questions.json';
import { playGameSfx } from '../audio/AmbientAudio';

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
                question.rewardItemId === 'gear' ? 'Bánh răng Quy luật' : 'Khế ước Thực tiễn',
          icon: question.rewardItemId === 'stone' ? '💎' :
                question.rewardItemId === 'mirror' ? '🪞' :
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
