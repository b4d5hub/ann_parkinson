import React, { useState } from 'react';
import './index.css';
import './App.css';

import Avatar from './components/Avatar3D/Avatar';
import ControlsPanel from './components/Dashboard/ControlsPanel';
import ResultsPanel from './components/Dashboard/ResultsPanel';
import LiveDiagnosticBar from './components/VoiceInterface/LiveDiagnosticBar';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';

function App() {
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  
  const [params, setParams] = useState({
    fo: 154,
    jitter: 0.005,
    shimmer: 0.02,
    hnr: 21.0,
    rpde: 0.45,
    dfa: 0.72
  });

  const { isAnalyzing, startLiveAnalysis, generateFakeData } = useAudioAnalyzer(setParams, setAvatarSpeaking);

  return (
    <div className="app-container">
      <div className="ambient-glow"></div>
      
      <ControlsPanel 
        params={params} 
        setParams={setParams} 
        startLiveAnalysis={startLiveAnalysis} 
        isAnalyzing={isAnalyzing}
        generateFakeData={generateFakeData}
      />
      
      <div className="center-panel">
        <div className="header-bar">
          <h1>Neural Simulation Core</h1>
        </div>
        
        <Avatar isSpeaking={avatarSpeaking || isAnalyzing} />
        
        <LiveDiagnosticBar 
          isAnalyzing={isAnalyzing} 
          startLiveAnalysis={startLiveAnalysis} 
        />
      </div>

      <ResultsPanel params={params} />
    </div>
  );
}

export default App;
