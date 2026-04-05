import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, BrainCircuit, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultsPanel = ({ params }) => {
  const [probability, setProbability] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        const data = await response.json();
        
        if (data.success) {
          setProbability(data.probability.toFixed(1));
        } else {
          console.error("Backend Error:", data.error);
        }
      } catch (err) {
        console.error("Failed to connect to Python backend.", err);
      }
      setLoading(false);
    };

    // Debounce the call slightly so we don't spam the server while sliding
    const timerId = setTimeout(() => {
      fetchPrediction();
    }, 300);

    return () => clearTimeout(timerId);
  }, [params]);

  const isHighRisk = probability > 50;
  const statusColor = isHighRisk ? '#FF265B' : '#00F0FF';
  const StatusIcon = isHighRisk ? ShieldAlert : ShieldCheck;

  return (
    <div className="glass-panel right-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          <BrainCircuit size={20} /> Analysis
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>Real-time ANN Prediction</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Main Status Display */}
        <div style={{ 
          background: 'rgba(0,0,0,0.4)', 
          borderRadius: '16px', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          border: `1px solid ${statusColor}40`,
          boxShadow: `inset 0 0 20px ${statusColor}10`
        }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <StatusIcon size={48} color={statusColor} />
          </motion.div>

          <h3 style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>PREDICTION SCORE</h3>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '8px' }}>
            <span style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'Outfit', color: statusColor, textShadow: `0 0 15px ${statusColor}` }}>
              {probability}
            </span>
            <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>%</span>
          </div>

          <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: '500', color: statusColor, letterSpacing: '1px' }}>
            {isHighRisk ? 'HIGH PROBABILITY DETECTED' : 'PARAMETERS NORMAL'}
          </p>
        </div>

        {/* Feature Importance Bars */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <BarChart3 size={14} /> FEATURE IMPACT
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Freq Variations', val: params.jitter * 1000 },
              { label: 'Amp Variations', val: params.shimmer * 400 },
              { label: 'Noise Ratio', val: (33 - params.hnr) }
            ].map((feature, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-main)' }}>{feature.label}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(feature.val * 3, 100)}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-purple))' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
        <button className="glass-button" style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}>
          Export Report
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;
