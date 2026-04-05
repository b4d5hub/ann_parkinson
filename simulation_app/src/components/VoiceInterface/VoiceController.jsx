import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const VoiceController = ({ isListening, setIsListening, setAvatarSpeaking, setParams }) => {
  const [transcript, setTranscript] = useState('');
  
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      
      // Basic command parsing logic
      const lower = currentTranscript.toLowerCase();
      
      let speechTriggered = false;
      if (lower.includes('high risk') || lower.includes('increase risk') || lower.includes('parkinson')) {
        if (setParams) {
          setParams(prev => ({ ...prev, jitter: Math.min(0.03, prev.jitter + 0.01), shimmer: Math.min(0.1, prev.shimmer + 0.02), hnr: Math.max(8, prev.hnr - 5) }));
        }
        speechTriggered = true;
      } else if (lower.includes('low risk') || lower.includes('normal') || lower.includes('decrease risk')) {
        if (setParams) {
          setParams(prev => ({ ...prev, jitter: Math.max(0.001, prev.jitter - 0.01), shimmer: Math.max(0.01, prev.shimmer - 0.02), hnr: Math.min(33, prev.hnr + 5) }));
        }
        speechTriggered = true;
      } else if (lower.includes('start simulation') || lower.includes('hello')) {
        speechTriggered = true;
      }

      if (speechTriggered) {
        setAvatarSpeaking(true);
        setTimeout(() => setAvatarSpeaking(false), 2000); // Simulate Avatar talking back
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // keep listening if intended
      }
    };

    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        // already started
      }
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, setIsListening, setAvatarSpeaking, setParams]);

  const toggleListen = () => {
    setIsListening(!isListening);
  };

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
        boxShadow: isListening ? '0 0 20px rgba(0, 240, 255, 0.3)' : '0 4px 15px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease'
      }}>
        
        <button 
          onClick={toggleListen}
          style={{
            background: isListening ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isListening ? '#000' : '#FFF',
            transition: 'all 0.3s ease'
          }}
        >
          {isListening ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <Mic size={24} />
            </motion.div>
          ) : (
            <MicOff size={24} />
          )}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            {isListening ? 'Listening...' : 'Voice Assistant Off'}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-main)', fontStyle: transcript ? 'normal' : 'italic', height: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {transcript || 'Say "High Risk" or "Normal"'}
          </span>
        </div>

        <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>

        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Settings size={20} />
        </button>

      </div>
    </div>
  );
};

export default VoiceController;
