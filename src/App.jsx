import React, { useEffect } from 'react';
import HUD from './components/ui/hud/HUD';
import MainCanvas from './components/3d/MainCanvas';
import QuestionOverlay from './components/ui/QuestionOverlay';
import RewardOverlay from './components/ui/RewardOverlay';
import GateGuardianModal from './components/ui/GateGuardianModal';
import Level2Minigame from './components/2d/Level2Minigame';
import Level3Minigame from './components/2d/Level3Minigame';
import EndingSlideshow from './components/2d/EndingSlideshow';
import AmbientAudio from './components/audio/AmbientAudio';
import { useGameStore } from './store/useGameStore';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', zIndex: 9999, position: 'absolute', top: 0, left: 0, background: 'black', padding: '20px', width: '100vw', height: '100vh', pointerEvents: 'auto' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const viewState = useGameStore((state) => state.viewState);
  const currentBranch = useGameStore((state) => state.currentBranch);

  return (
    <>
      <ErrorBoundary>
        <MainCanvas />
      </ErrorBoundary>

      <AmbientAudio />
      {viewState === 'ENDING' && <EndingSlideshow />}
      
      {/* 2D UI Overlay Layer */}
      {viewState !== 'ENDING' && <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10 }}>
        
        <QuestionOverlay />
        <RewardOverlay />
        <GateGuardianModal />

        {/* Top Right HUD */}
        <div style={{ pointerEvents: 'auto' }}>
          <HUD />
        </div>
        
        {/* Top Left Title & Logo */}
        <div style={{ position: 'absolute', top: '25px', left: '35px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/favicon.svg?v=2" 
            alt="Biểu Tượng Triết Học Dialectica" 
            style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.6), 0 0 10px rgba(239, 68, 68, 0.5)',
              border: '1.5px solid #fbbf24'
            }} 
          />
          <div>
            <h1 className="fw-bold gradient-text m-0" style={{ fontSize: '26px', filter: 'drop-shadow(0 4px 10px rgba(239, 68, 68, 0.4))', letterSpacing: '1.5px', lineHeight: '1.1' }}>
              DIALECTICA
            </h1>
            <p style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 'bold', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))', letterSpacing: '0.8px', margin: '4px 0 0 0' }}>
              Hành Trình Khám Phá Tâm Thức & Biện Chứng 3D
            </p>
          </div>
        </div>
        
        {viewState === 'BRANCH' && currentBranch === 2 && (
          <div style={{ pointerEvents: 'auto' }}>
            <Level2Minigame />
          </div>
        )}
        
        {((viewState === 'BRANCH' && currentBranch === 3) || viewState === 'LEVEL_3') && (
          <div style={{ pointerEvents: 'auto' }}>
            <Level3Minigame />
          </div>
        )}

      </div>}
    </>
  );
}

export default App;
