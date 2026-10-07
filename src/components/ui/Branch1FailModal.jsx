import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'react-bootstrap';
import { useGameStore } from '../../store/useGameStore';
import { playGameSfx } from '../audio/AmbientAudio';

const Branch1FailModal = () => {
  const { branch1Failed, resetBranch1 } = useGameStore();

  if (!branch1Failed) return null;

  const handleRetry = () => {
    playGameSfx('unlock');
    resetBranch1();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(11, 4, 7, 0.94)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 120,
          pointerEvents: 'auto',
        }}
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(38, 10, 16, 0.96), rgba(20, 5, 8, 0.98))',
            border: '2px solid #ef4444',
            borderRadius: '24px',
            padding: '40px 45px',
            maxWidth: '580px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(239, 68, 68, 0.4), inset 0 0 30px rgba(239, 68, 68, 0.15)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 25px rgba(239, 68, 68, 0.7))' }}
          >
            ⚠️
          </motion.div>

          <h2
            className="fw-bold mb-3"
            style={{
              color: '#f87171',
              fontFamily: 'Segoe UI, sans-serif',
              letterSpacing: '1.5px',
              textShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
            }}
          >
            BẠN ĐÃ THẤT BẠI
          </h2>

          <p
            className="fs-5 text-white mb-4 lh-lg"
            style={{
              color: '#fecaca',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            Bạn đã trả lời sai câu hỏi chứa nguyên liệu quan trọng và <strong>không thể thu thập đủ 2 vật phẩm</strong> (💎 Bản Thể Khách Quan & 🪞 Gương Phản Ánh Tư Duy) để ghép Chìa Khóa Nhãn Quan Duy Vật mở cánh cổng Nhánh 2.
          </p>

          <div
            className="d-flex justify-content-center gap-3 p-3 mb-4 rounded-4"
            style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <div className="d-flex align-items-center gap-2" style={{ color: '#fca5a5', fontSize: '14px' }}>
              <span>💎 Bản Thể:</span> <strong className="text-warning">Ngẫu nhiên</strong>
            </div>
            <div className="text-secondary">|</div>
            <div className="d-flex align-items-center gap-2" style={{ color: '#fca5a5', fontSize: '14px' }}>
              <span>🪞 Tư Duy:</span> <strong className="text-warning">Ngẫu nhiên</strong>
            </div>
          </div>

          <Button
            variant="danger"
            size="lg"
            className="px-5 py-3 fw-bold rounded-pill shadow-lg text-uppercase"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
              border: '1px solid #f87171',
              color: '#fff',
              fontSize: '16px',
              letterSpacing: '1px',
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.5)',
            }}
            onClick={handleRetry}
          >
            🔄 Chơi Lại Nhánh 1
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Branch1FailModal;
