import React from 'react';
import { Mic, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveDiagnosticBar = ({ isAnalyzing, startLiveAnalysis }) => {
  return (
    <div className="voice-bar">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        background: 'rgba(20, 20, 30, 0.8)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)',
        padding: '10px 16px', 
        borderRadius: '32px',
        border: '1px solid var(--glass-border)',
        boxShadow: isAnalyzing ? '0 0 20px rgba(0, 240, 255, 0.3)' : '0 4px 15px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease',
        maxWidth: '100%',
        width: 'max-content',
      }}>
        
        {/* Mic button */}
        <button 
          onClick={startLiveAnalysis}
          disabled={isAnalyzing}
          aria-label={isAnalyzing ? 'Analyzing audio' : 'Start live analysis'}
          style={{
            background: isAnalyzing ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            flexShrink: 0,
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
              <Activity size={22} />
            </motion.div>
          ) : (
            <Mic size={22} />
          )}
        </button>

        {/* Status text — hidden on very small screens via CSS */}
        <div className="diag-text" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
            {isAnalyzing ? 'Extracting Vocal Markers...' : 'Live Web Audio Diagnostic'}
          </span>
          <span style={{ fontSize: '13px', color: isAnalyzing ? 'var(--accent-teal)' : 'var(--text-main)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
            {isAnalyzing ? 'Analyzing 5-second sample...' : 'Press Mic & read a short sentence.'}
          </span>
        </div>

        {/* Divider */}
        <div className="diag-divider" style={{ width: '1px', height: '28px', background: 'var(--glass-border)', flexShrink: 0 }}></div>

        {/* Ready indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', flexShrink: 0 }}>
          <CheckCircle2 size={15} />
          <span className="diag-ready" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>System Ready</span>
        </div>

      </div>
    </div>
  );
};

export default LiveDiagnosticBar;
