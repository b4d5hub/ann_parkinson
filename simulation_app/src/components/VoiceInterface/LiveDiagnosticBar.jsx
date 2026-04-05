import React from 'react';
import { Mic, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveDiagnosticBar = ({ isAnalyzing, startLiveAnalysis }) => {
  return (
    <div className="voice-bar">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px', 
        background: 'rgba(20, 20, 30, 0.8)', 
        backdropFilter: 'blur(16px)', 
        padding: '12px 24px', 
        borderRadius: '32px',
        border: '1px solid var(--glass-border)',
        boxShadow: isAnalyzing ? '0 0 20px rgba(0, 240, 255, 0.3)' : '0 4px 15px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease'
      }}>
        
        <button 
          onClick={startLiveAnalysis}
          disabled={isAnalyzing}
          style={{
            background: isAnalyzing ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isAnalyzing ? 'default' : 'pointer',
            color: isAnalyzing ? '#000' : '#FFF',
            transition: 'all 0.3s ease'
          }}
        >
          {isAnalyzing ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <Activity size={24} />
            </motion.div>
          ) : (
            <Mic size={24} />
          )}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            {isAnalyzing ? 'Extracting Vocal Markers...' : 'Live Web Audio Diagnostic'}
          </span>
          <span style={{ fontSize: '14px', color: isAnalyzing ? 'var(--accent-teal)' : 'var(--text-main)', fontStyle: 'italic', height: '20px' }}>
            {isAnalyzing ? 'Analyzing 5-second sample...' : 'Press Mic & read a short sentence.'}
          </span>
        </div>

        <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={16} />
          <span style={{ fontSize: '12px' }}>System Ready</span>
        </div>

      </div>
    </div>
  );
};

export default LiveDiagnosticBar;
