import React from 'react';
import { Sliders, Activity, Mic, Zap, Moon, Sun } from 'lucide-react';

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

const UI_SLIDERS = [
  { key: 'fo', label: 'MDVP:Fo(Hz)', min: 80, max: 260, step: 1, icon: Activity },
  { key: 'fhi', label: 'MDVP:Fhi(Hz)', min: 100, max: 300, step: 1, icon: Activity },
  { key: 'flo', label: 'MDVP:Flo(Hz)', min: 60, max: 200, step: 1, icon: Activity },
  { key: 'jitter', label: 'MDVP:Jitter(%)', min: 0.001, max: 0.03, step: 0.001, icon: Mic },
  { key: 'jitterAbs', label: 'MDVP:Jitter(Abs)', min: 0.00001, max: 0.0001, step: 0.00001, icon: Mic },
  { key: 'rap', label: 'MDVP:RAP', min: 0.001, max: 0.01, step: 0.001, icon: Mic },
  { key: 'ppq', label: 'MDVP:PPQ', min: 0.001, max: 0.01, step: 0.001, icon: Mic },
  { key: 'jitterDDP', label: 'Jitter:DDP', min: 0.003, max: 0.03, step: 0.001, icon: Mic },
  { key: 'shimmer', label: 'MDVP:Shimmer', min: 0.01, max: 0.1, step: 0.001, icon: Mic },
  { key: 'shimmerDb', label: 'MDVP:Shimmer(dB)', min: 0.1, max: 1.0, step: 0.01, icon: Mic },
  { key: 'shimmerAPQ3', label: 'Shimmer:APQ3', min: 0.005, max: 0.05, step: 0.005, icon: Mic },
  { key: 'shimmerAPQ5', label: 'Shimmer:APQ5', min: 0.005, max: 0.05, step: 0.005, icon: Mic },
  { key: 'shimmerAPQ', label: 'MDVP:APQ', min: 0.01, max: 0.1, step: 0.01, icon: Mic },
  { key: 'shimmerDDA', label: 'Shimmer:DDA', min: 0.015, max: 0.15, step: 0.005, icon: Mic },
  { key: 'nhr', label: 'NHR', min: 0.005, max: 0.1, step: 0.005, icon: Zap },
  { key: 'hnr', label: 'HNR', min: 8, max: 33, step: 0.1, icon: Zap },
  { key: 'rpde', label: 'RPDE', min: 0.2, max: 0.7, step: 0.01, icon: Sliders },
  { key: 'dfa', label: 'DFA', min: 0.4, max: 0.9, step: 0.01, icon: Sliders },
  { key: 'spread1', label: 'spread1', min: -8, max: -3, step: 0.1, icon: Sliders },
  { key: 'spread2', label: 'spread2', min: 0.05, max: 0.5, step: 0.01, icon: Sliders },
  { key: 'd2', label: 'D2', min: 1.5, max: 3.5, step: 0.1, icon: Sliders },
  { key: 'ppe', label: 'PPE', min: 0.05, max: 0.5, step: 0.01, icon: Sliders }
];

const ControlsPanel = ({ params, setParams, startLiveAnalysis, isAnalyzing, generateFakeData, isDarkMode, toggleTheme }) => {
  const handleChange = (key, val) => {
    setParams(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  return (
    <div className="glass-panel left-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            <Sliders size={20} /> Parameters
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Adjust 22 biomarkers for simulation</p>
        </div>
        <button onClick={toggleTheme} className="theme-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px', paddingBottom: '20px' }} className="custom-scroll">
        {UI_SLIDERS.map(slider => (
            <ControlGroup 
                key={slider.key}
                label={slider.label} 
                icon={slider.icon} 
                min={slider.min} max={slider.max} step={slider.step} 
                value={params[slider.key]} 
                onChange={(e) => handleChange(slider.key, e.target.value)} 
            />
        ))}
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
          onClick={() => setParams({ 
              fo: 154, fhi: 197, flo: 116, jitter: 0.006, jitterAbs: 0.00004, rap: 0.003, ppq: 0.003, jitterDDP: 0.009, 
              shimmer: 0.029, shimmerDb: 0.28, shimmerAPQ3: 0.015, shimmerAPQ5: 0.017, shimmerAPQ: 0.024, shimmerDDA: 0.046, 
              nhr: 0.024, hnr: 21.0, rpde: 0.49, dfa: 0.71, spread1: -5.6, spread2: 0.22, d2: 2.38, ppe: 0.20 
          })}
        >
          Reset Factory Baseline
        </button>
      </div>
    </div>
  );
};

export default ControlsPanel;
