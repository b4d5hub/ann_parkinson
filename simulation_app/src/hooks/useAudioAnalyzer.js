import { useState, useRef, useEffect } from 'react';

export const useAudioAnalyzer = (setParams, setAvatarSpeaking) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Clean up
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const stopLiveAnalysis = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setIsAnalyzing(false);
    setAvatarSpeaking(false);
  };

  const startLiveAnalysis = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      sourceRef.current.connect(analyserRef.current);
      
      setIsAnalyzing(true);
      setAvatarSpeaking(true); // make avatar pulse
      
      let frameCount = 0;
      let totalPitch = 0;
      let pitchSamples = [];
      let ampSamples = [];
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const analyze = () => {
        analyserRef.current.getByteTimeDomainData(dataArray);
        
        let sumSquares = 0;
        let zeroCrossings = 0;
        let previousVal = 128;
        
        for (let i = 0; i < bufferLength; i++) {
          let val = dataArray[i];
          let normalized = (val - 128) / 128;
          sumSquares += normalized * normalized;
          
          if (val >= 128 && previousVal < 128) zeroCrossings++;
          previousVal = val;
        }
        
        const rms = Math.sqrt(sumSquares / bufferLength);
        const pitchApprox = (zeroCrossings * audioContextRef.current.sampleRate) / (2 * bufferLength);
        
        // Only consider frames with actual sound
        if (rms > 0.01) {
          pitchSamples.push(pitchApprox);
          ampSamples.push(rms);
          frameCount++;
        }
        
        animationFrameRef.current = requestAnimationFrame(analyze);
      };
      
      analyze();
      
      // Stop and calculate after 3 seconds
      setTimeout(() => {
        stopLiveAnalysis();
        
        if (pitchSamples.length > 10) {
          // Calculate mock Jitter (Avg absolute difference between consecutive periods / avg period)
          let pitchDiffs = 0;
          let pitchSum = 0;
          for(let i=0; i<pitchSamples.length; i++){
              pitchSum += pitchSamples[i];
              if(i > 0) pitchDiffs += Math.abs(pitchSamples[i] - pitchSamples[i-1]);
          }
          let avgPitch = pitchSum / pitchSamples.length;
          let mockJitter = (pitchDiffs / (pitchSamples.length - 1)) / avgPitch;
          
          // Calculate mock Shimmer (Avg absolute difference between consecutive amps / avg amp)
          let ampDiffs = 0;
          let ampSum = 0;
          for(let i=0; i<ampSamples.length; i++){
              ampSum += ampSamples[i];
              if(i > 0) ampDiffs += Math.abs(ampSamples[i] - ampSamples[i-1]);
          }
          let avgAmp = ampSum / ampSamples.length;
          let mockShimmer = (ampDiffs / (ampSamples.length - 1)) / avgAmp;
          
          // Jitter typically 0.001 - 0.03
          // Heavily scaled down to account for raw mic noise. Normal speech will be ~0.005.
          let finalJitter = Math.min(Math.max(mockJitter * 0.02, 0.001), 0.03);
          // Shimmer typically 0.01 - 0.1
          let finalShimmer = Math.min(Math.max(mockShimmer * 0.03, 0.01), 0.1);
          // HNR relies on harmonic vs noise.
          let finalHNR = Math.min(Math.max(33 - (mockJitter * 20) - (mockShimmer * 5), 8), 33);
          
          setParams(prev => ({
            ...prev,
            fo: isNaN(avgPitch) || avgPitch > 300 || avgPitch < 50 ? prev.fo : Math.round(avgPitch),
            jitter: parseFloat(finalJitter.toFixed(5)),
            shimmer: parseFloat(finalShimmer.toFixed(5)),
            hnr: parseFloat(finalHNR.toFixed(2))
          }));
        } else {
           console.log("Not enough audio detected.");
        }
      }, 5000); // 5 second analysis window
      
      
    } catch (err) {
      console.error("Camera/Mic access denied or error:", err);
      setIsAnalyzing(false);
      setAvatarSpeaking(false);
    }
  };

  const generateFakeData = (type) => {
    // type = 'parkinson' or 'healthy' or 'random'
    setAvatarSpeaking(true);
    let mockValues = {};
    if (type === 'parkinson') {
        mockValues = {
            fo: 120 + Math.random() * 40,
            jitter: 0.015 + Math.random() * 0.015, // High: 0.015 to 0.03
            shimmer: 0.05 + Math.random() * 0.05,  // High: 0.05 to 0.1
            hnr: 8 + Math.random() * 12,           // Low: 8 to 20
            rpde: 0.5 + Math.random() * 0.2,
            dfa: 0.7 + Math.random() * 0.2
        };
    } else if (type === 'healthy') {
        mockValues = {
            fo: 150 + Math.random() * 50,
            jitter: 0.001 + Math.random() * 0.005, // Low: 0.001 to 0.006
            shimmer: 0.01 + Math.random() * 0.02,  // Low: 0.01 to 0.03
            hnr: 25 + Math.random() * 8,           // High: 25 to 33
            rpde: 0.2 + Math.random() * 0.2,
            dfa: 0.5 + Math.random() * 0.15
        };
    } else {
        mockValues = {
            fo: 80 + Math.random() * 180,
            jitter: 0.001 + Math.random() * 0.029,
            shimmer: 0.01 + Math.random() * 0.09,
            hnr: 8 + Math.random() * 25,
            rpde: 0.2 + Math.random() * 0.5,
            dfa: 0.5 + Math.random() * 0.4
        };
    }
    
    // Animate sliders changing over 1 second instead of instant
    setParams(prev => {
        return {
            fo: parseFloat(mockValues.fo.toFixed(1)),
            jitter: parseFloat(mockValues.jitter.toFixed(5)),
            shimmer: parseFloat(mockValues.shimmer.toFixed(5)),
            hnr: parseFloat(mockValues.hnr.toFixed(2)),
            rpde: parseFloat(mockValues.rpde.toFixed(3)),
            dfa: parseFloat(mockValues.dfa.toFixed(3))
        };
    });
    
    setTimeout(() => {
        setAvatarSpeaking(false);
    }, 1500);
  };

  return {
    isAnalyzing,
    startLiveAnalysis,
    generateFakeData
  };
};
