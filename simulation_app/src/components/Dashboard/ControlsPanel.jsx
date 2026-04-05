import React from 'react';
import { Sliders, Activity, Mic, Zap } from 'lucide-react';

const ControlGroup = ({ label, icon: Icon, value, onChange, min, max, step }) => (
  <div className="control-group" style={{ marginBottom: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
        <Icon size={16} color="var(--accent-teal)" />
        {label}
      </label>
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)' }}>{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={onChange}
      style={{
        width: '100%',
        accentColor: 'var(--accent-teal)',
        cursor: 'pointer',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        outline: 'none',
        WebkitAppearance: 'none'
      }}
    />
  </div>
);

const ControlsPanel = ({ params, setParams, startLiveAnalysis, isAnalyzing, generateFakeData }) => {
  const handleChange = (key, val) => {
    setParams(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  return (
    <div className="glass-panel left-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          <Sliders size={20} /> Parameters
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Adjust biomarkers for simulation</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
        <ControlGroup 
          label="MDVP:Fo(Hz) [Fund. Freq]" 
          icon={Activity} 
          min={80} max={260} step={1} 
          value={params.fo} 
          onChange={(e) => handleChange('fo', e.target.value)} 
        />
        <ControlGroup 
          label="MDVP:Jitter(%)" 
          icon={Mic} 
          min={0.001} max={0.03} step={0.001} 
          value={params.jitter} 
          onChange={(e) => handleChange('jitter', e.target.value)} 
        />
        <ControlGroup 
          label="MDVP:Shimmer" 
          icon={Mic} 
          min={0.01} max={0.1} step={0.001} 
          value={params.shimmer} 
          onChange={(e) => handleChange('shimmer', e.target.value)} 
        />
        <ControlGroup 
          label="HNR [Harmonic-to-Noise]" 
          icon={Zap} 
          min={8} max={33} step={0.1} 
          value={params.hnr} 
          onChange={(e) => handleChange('hnr', e.target.value)} 
        />
        <ControlGroup 
          label="RPDE [Recurrence Period]" 
          icon={Activity} 
          min={0.2} max={0.7} step={0.01} 
          value={params.rpde} 
          onChange={(e) => handleChange('rpde', e.target.value)} 
        />
        <ControlGroup 
          label="DFA [Detrended Fluctuation]" 
          icon={Sliders} 
          min={0.5} max={0.9} step={0.01} 
          value={params.dfa} 
          onChange={(e) => handleChange('dfa', e.target.value)} 
        />
      </div>

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Simulation Tools</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="glass-button" 
            style={{ flex: 1, fontSize: '10px', padding: '8px' }}
            onClick={() => generateFakeData('parkinson')}
          >
            Sim. High Risk
          </button>
          <button 
            className="glass-button" 
            style={{ flex: 1, fontSize: '10px', padding: '8px' }}
            onClick={() => generateFakeData('healthy')}
          >
            Sim. Normal
          </button>
        </div>
      </div>

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
        <button 
          className="glass-button" 
          style={{ width: '100%' }}
          onClick={() => setParams({ fo: 154, jitter: 0.005, shimmer: 0.02, hnr: 21.0, rpde: 0.45, dfa: 0.72 })}
        >
          Reset Parameters
        </button>
      </div>
    </div>
  );
};

export default ControlsPanel;
