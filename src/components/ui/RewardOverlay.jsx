import React from 'react';
import { Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { playGameSfx } from '../audio/AmbientAudio';

const RewardOverlay = () => {
  const { rewardPopup, setRewardPopup, addItem, setViewState } = useGameStore();

  const handleCollectItem = () => {
    if (rewardPopup) {
      playGameSfx('pickup');
      addItem(rewardPopup);
      const targetState = rewardPopup.targetViewState || 'BRANCH';
      setRewardPopup(null);
      setViewState(targetState); // Return to the target state
    }
  };

  if (!rewardPopup) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(11, 7, 9, 0.88)', backdropFilter: 'blur(10px)',
        zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center',
        pointerEvents: 'auto'
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-panel text-center py-5"
        style={{
          width: '800px', maxWidth: '90%', padding: '40px',
          borderRadius: '24px', border: '1px solid rgba(251, 191, 36, 0.5)',
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.35), 0 0 25px rgba(239, 68, 68, 0.2)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <h2 className="mb-4 text-warning fw-bold" style={{ textShadow: '0 0 15px rgba(251, 191, 36, 0.5)' }}>✨ Tuyệt vời! Bạn nhận được:</h2>
        <motion.div 
          animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontSize: '80px', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))' }}
        >
          {rewardPopup.icon}
        </motion.div>
        <h3 className="text-white mb-5 fw-bold">{rewardPopup.name}</h3>
        <Button 
          variant="warning" 
          size="lg" 
          className="fw-bold px-5 py-3 rounded-pill shadow-lg text-uppercase" 
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 50%, #facc15 100%)',
            border: 'none', color: '#000', letterSpacing: '1px'
          }}
          onClick={handleCollectItem}
        >
          Thu Nhận & Tiếp Tục
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default RewardOverlay;
