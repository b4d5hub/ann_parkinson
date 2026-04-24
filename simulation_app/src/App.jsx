import React, { useState } from 'react';
import './index.css';
import './App.css';

import Avatar from './components/Avatar3D/Avatar';
import ControlsPanel from './components/Dashboard/ControlsPanel';
import ResultsPanel from './components/Dashboard/ResultsPanel';
import LiveDiagnosticBar from './components/VoiceInterface/LiveDiagnosticBar';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { useIsMobile } from './hooks/useIsMobile';
import { Sliders, BrainCircuit, Scan } from 'lucide-react';

// ─── Shared panel content (used by both layouts) ─────────────────────────────

function CenterPanelContent({ avatarSpeaking, isAnalyzing, startLiveAnalysis }) {
  return (
    <>
      <div className="header-bar">
        <h1>Neural Simulation Core - V7</h1>
      </div>
      <Avatar isSpeaking={avatarSpeaking || isAnalyzing} />
      <LiveDiagnosticBar isAnalyzing={isAnalyzing} startLiveAnalysis={startLiveAnalysis} />
    </>
  );
}

// ─── Desktop layout: 3-column ─────────────────────────────────────────────────

function DesktopLayout({ params, setParams, isAnalyzing, startLiveAnalysis, generateFakeData,
  isDarkMode, toggleTheme, avatarSpeaking }) {
  return (
    <div className={`app-container ${isDarkMode ? '' : 'light-mode'}`}>
      <div className="ambient-glow" />

      <ControlsPanel
        params={params} setParams={setParams}
        startLiveAnalysis={startLiveAnalysis} isAnalyzing={isAnalyzing}
        generateFakeData={generateFakeData}
        isDarkMode={isDarkMode} toggleTheme={toggleTheme}
      />

      <div className="center-panel">
        <CenterPanelContent
          avatarSpeaking={avatarSpeaking}
          isAnalyzing={isAnalyzing}
          startLiveAnalysis={startLiveAnalysis}
        />
      </div>

      <ResultsPanel params={params} />
    </div>
  );
}

// ─── Mobile layout: full-screen tabs ─────────────────────────────────────────

const TABS = [
  { id: 'controls', label: 'Parameters', Icon: Sliders },
  { id: 'simulation', label: 'Simulation', Icon: Scan },
  { id: 'results', label: 'Analysis', Icon: BrainCircuit },
];

function MobileLayout({ params, setParams, isAnalyzing, startLiveAnalysis, generateFakeData,
  isDarkMode, toggleTheme, avatarSpeaking }) {
  const [activeTab, setActiveTab] = useState('simulation');

  return (
    <div className={`mobile-root ${isDarkMode ? '' : 'light-mode'}`}>
      <div className="ambient-glow" />

      {/* ── Tab content area ── */}
      <div className="mobile-content">

        {/* Parameters tab */}
        {activeTab === 'controls' && (
          <div className="mobile-panel">
            <ControlsPanel
              params={params} setParams={setParams}
              startLiveAnalysis={startLiveAnalysis} isAnalyzing={isAnalyzing}
              generateFakeData={generateFakeData}
              isDarkMode={isDarkMode} toggleTheme={toggleTheme}
              mobileMode
            />
          </div>
        )}

        {/* Simulation tab */}
        {activeTab === 'simulation' && (
          <div className="mobile-panel mobile-center">
            <CenterPanelContent
              avatarSpeaking={avatarSpeaking}
              isAnalyzing={isAnalyzing}
              startLiveAnalysis={startLiveAnalysis}
            />
          </div>
        )}

        {/* Analysis tab */}
        {activeTab === 'results' && (
          <div className="mobile-panel mobile-scroll">
            <ResultsPanel params={params} mobileMode />
          </div>
        )}
      </div>

      {/* ── Bottom navigation bar ── */}
      <nav className="mobile-nav" aria-label="Main navigation">
        <div className="mobile-nav-inner">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`mob-nav-${id}`}
              className={`mobile-nav-btn${activeTab === id ? ' active' : ''}`}
              onClick={() => setActiveTab(id)}
              aria-label={label}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function App() {
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const isMobile = useIsMobile(767);

  const [params, setParams] = useState({
    fo: 154, fhi: 197, flo: 116,
    jitter: 0.006, jitterAbs: 0.00004, rap: 0.003, ppq: 0.003, jitterDDP: 0.009,
    shimmer: 0.029, shimmerDb: 0.28, shimmerAPQ3: 0.015, shimmerAPQ5: 0.017,
    shimmerAPQ: 0.024, shimmerDDA: 0.046,
    nhr: 0.024, hnr: 21.0,
    rpde: 0.49, dfa: 0.71,
    spread1: -5.6, spread2: 0.22, d2: 2.38, ppe: 0.20,
  });

  const { isAnalyzing, startLiveAnalysis, generateFakeData } =
    useAudioAnalyzer(setParams, setAvatarSpeaking);

  const shared = {
    params, setParams, isAnalyzing, startLiveAnalysis, generateFakeData,
    isDarkMode, toggleTheme: () => setIsDarkMode(d => !d), avatarSpeaking,
  };

  return isMobile
    ? <MobileLayout {...shared} />
    : <DesktopLayout {...shared} />;
}

export default App;
