import React, { useState } from 'react';
import './index.css';
import './App.css';

import Avatar from './components/Avatar3D/Avatar';
import ControlsPanel from './components/Dashboard/ControlsPanel';
import ResultsPanel from './components/Dashboard/ResultsPanel';
import LiveDiagnosticBar from './components/VoiceInterface/LiveDiagnosticBar';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { Sliders, BrainCircuit, Scan } from 'lucide-react';

function App() {
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileTab, setMobileTab] = useState('center'); // 'controls' | 'center' | 'results'

  const [params, setParams] = useState({
    fo: 154, fhi: 197, flo: 116,
    jitter: 0.006, jitterAbs: 0.00004, rap: 0.003, ppq: 0.003, jitterDDP: 0.009,
    shimmer: 0.029, shimmerDb: 0.28, shimmerAPQ3: 0.015, shimmerAPQ5: 0.017, shimmerAPQ: 0.024, shimmerDDA: 0.046,
    nhr: 0.024, hnr: 21.0,
    rpde: 0.49, dfa: 0.71,
    spread1: -5.6, spread2: 0.22, d2: 2.38, ppe: 0.20
  });

  const { isAnalyzing, startLiveAnalysis, generateFakeData } = useAudioAnalyzer(setParams, setAvatarSpeaking);

  return (
    <div className={`app-container ${isDarkMode ? '' : 'light-mode'}`}>
      <div className="ambient-glow"></div>

      <ControlsPanel
        params={params}
        setParams={setParams}
        startLiveAnalysis={startLiveAnalysis}
        isAnalyzing={isAnalyzing}
        generateFakeData={generateFakeData}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        extraClass={mobileTab === 'controls' ? 'mobile-active' : ''}
      />

      <div className={`center-panel${mobileTab === 'center' ? ' mobile-active' : ''}`}>
        <div className="header-bar">
          <h1>Neural Simulation Core</h1>
        </div>

        <Avatar isSpeaking={avatarSpeaking || isAnalyzing} />

        <LiveDiagnosticBar
          isAnalyzing={isAnalyzing}
          startLiveAnalysis={startLiveAnalysis}
        />
      </div>

      <ResultsPanel
        params={params}
        extraClass={mobileTab === 'results' ? 'mobile-active' : ''}
      />

      {/* ---- Mobile bottom navigation ---- */}
      <nav className="mobile-nav" aria-label="Main navigation">
        <div className="mobile-nav-inner">
          <button
            id="mob-nav-controls"
            className={`mobile-nav-btn ${mobileTab === 'controls' ? 'active' : ''}`}
            onClick={() => setMobileTab('controls')}
            aria-label="Parameters panel"
          >
            <Sliders size={20} />
            Parameters
          </button>

          <button
            id="mob-nav-center"
            className={`mobile-nav-btn ${mobileTab === 'center' ? 'active' : ''}`}
            onClick={() => setMobileTab('center')}
            aria-label="Neural simulation view"
          >
            <Scan size={20} />
            Simulation
          </button>

          <button
            id="mob-nav-results"
            className={`mobile-nav-btn ${mobileTab === 'results' ? 'active' : ''}`}
            onClick={() => setMobileTab('results')}
            aria-label="Analysis results panel"
          >
            <BrainCircuit size={20} />
            Analysis
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
