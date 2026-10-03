import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'react-bootstrap';
import { useGameStore } from '../../store/useGameStore';
import { playGameSfx } from '../audio/AmbientAudio';

const GateGuardianModal = () => {
  const { lockedPortalTarget, setLockedPortalTarget, hasKeyForBranch, consumeKeyAndUnlock } = useGameStore();
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    if (lockedPortalTarget) {
      setHasKey(hasKeyForBranch(lockedPortalTarget));
    }
  }, [lockedPortalTarget, hasKeyForBranch]);

  if (!lockedPortalTarget) return null;

  const handleUnlock = () => {
    playGameSfx('unlock');
    consumeKeyAndUnlock(lockedPortalTarget);
    setLockedPortalTarget(null);
  };

  const branchName = lockedPortalTarget === 2 ? 'Nhánh 2: Phép Biện Chứng (Đấu Trường Biện Chứng)' 
                   : lockedPortalTarget === 3 ? 'Nhánh 3: Lý Luận Nhận Thức (Thực Tiễn & Chân Lý)' 
                   : 'Kho Tàng Tối Thượng (Cung Điện Chân Lý)';
                   
  const keyName = lockedPortalTarget === 2 ? 'Chìa khóa Nhãn quan Duy vật' 
                : lockedPortalTarget === 3 ? 'Chìa Khóa Bước Nhảy' 
                : 'Chìa khóa Bánh xe Lịch sử';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(11, 7, 9, 0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 100, pointerEvents: 'auto'
        }}
      >
        <motion.div 
          initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(28, 11, 17, 0.95), rgba(18, 7, 11, 0.98))',
            border: '2px solid #fbbf24', borderRadius: '20px',
            padding: '40px', maxWidth: '600px', width: '90%',
            textAlign: 'center', boxShadow: '0 0 50px rgba(245, 158, 11, 0.35), 0 0 20px rgba(239, 68, 68, 0.25)'
          }}
        >
          <motion.div 
            animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 3.5 }}
            style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px #fbbf24)' }}
          >
            🏛️
          </motion.div>
          <h2 className="text-warning fw-bold mb-3" style={{ fontFamily: 'Segoe UI, sans-serif', letterSpacing: '1px' }}>
            NGƯỜI GÁC CỔNG BIỆN CHỨNG
          </h2>
          <p className="fs-5 text-white mb-4 lh-lg" style={{ fontStyle: 'normal', color: '#fef08a' }}>
            "Hỡi người tìm kiếm chân lý... Để khai mở cánh cổng tiến vào <strong>{branchName}</strong>, bạn cần đúc kết thành quả tri thức và rèn đúc thành công <strong>{keyName}</strong> tại Lò Luyện.<br/>
            Cánh cổng này chỉ mở ra trước quy luật biện chứng khách quan và sự chuyển hóa về chất.<br/>
            Bạn đã sẵn sàng khai mở cảnh giới mới chưa?"
          </p>
          
          <div className="d-flex justify-content-center gap-4 mt-4">
            <Button 
              variant="outline-light" 
              className="px-4 py-2 fw-bold rounded-pill" 
              style={{ borderColor: 'rgba(251, 191, 36, 0.4)', color: '#fef08a' }}
              onClick={() => setLockedPortalTarget(null)}
            >
              Quay lại Lò Luyện
            </Button>
            
            {hasKey ? (
              <Button 
                variant="warning" 
                className="px-4 py-2 fw-bold rounded-pill" 
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                  border: 'none', color: '#fff',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
                }}
                onClick={handleUnlock}
              >
                Khai Mở Cánh Cổng
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                className="px-4 py-2 fw-bold rounded-pill" 
                style={{ backgroundColor: '#2b1017', borderColor: '#7f1d1d', color: '#f87171' }}
                disabled
              >
                Chưa đủ điều kiện mở khóa!
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GateGuardianModal;
