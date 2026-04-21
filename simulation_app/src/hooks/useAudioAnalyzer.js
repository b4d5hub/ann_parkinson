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
            fo: 120 + Math.random() * 40, fhi: 180 + Math.random() * 40, flo: 90 + Math.random() * 30,
            jitter: 0.015 + Math.random() * 0.015, jitterAbs: 0.0001 + Math.random() * 0.0001, rap: 0.008 + Math.random() * 0.01, ppq: 0.009 + Math.random() * 0.01, jitterDDP: 0.02 + Math.random() * 0.03,
            shimmer: 0.05 + Math.random() * 0.05, shimmerDb: 0.4 + Math.random() * 0.5, shimmerAPQ3: 0.03 + Math.random() * 0.03, shimmerAPQ5: 0.04 + Math.random() * 0.04, shimmerAPQ: 0.05 + Math.random() * 0.05, shimmerDDA: 0.09 + Math.random() * 0.09,
            nhr: 0.05 + Math.random() * 0.05, hnr: 8 + Math.random() * 12,
            rpde: 0.5 + Math.random() * 0.2, dfa: 0.7 + Math.random() * 0.2,
            spread1: -4.5 + Math.random() * 1.5, spread2: 0.25 + Math.random() * 0.15, d2: 2.6 + Math.random() * 0.6, ppe: 0.25 + Math.random() * 0.15
        };
    } else if (type === 'healthy') {
        mockValues = {
            fo: 180 + Math.random() * 50, fhi: 220 + Math.random() * 40, flo: 140 + Math.random() * 30,
            jitter: 0.002 + Math.random() * 0.004, jitterAbs: 0.00002 + Math.random() * 0.00003, rap: 0.001 + Math.random() * 0.002, ppq: 0.001 + Math.random() * 0.002, jitterDDP: 0.003 + Math.random() * 0.006,
            shimmer: 0.01 + Math.random() * 0.02, shimmerDb: 0.1 + Math.random() * 0.1, shimmerAPQ3: 0.005 + Math.random() * 0.01, shimmerAPQ5: 0.006 + Math.random() * 0.01, shimmerAPQ: 0.01 + Math.random() * 0.01, shimmerDDA: 0.015 + Math.random() * 0.03,
            nhr: 0.005 + Math.random() * 0.01, hnr: 24 + Math.random() * 9,
            rpde: 0.3 + Math.random() * 0.15, dfa: 0.55 + Math.random() * 0.15,
            spread1: -7.0 + Math.random() * 1.5, spread2: 0.1 + Math.random() * 0.1, d2: 2.0 + Math.random() * 0.3, ppe: 0.1 + Math.random() * 0.1
        };
    } else {
        mockValues = {
            fo: 80 + Math.random() * 180, fhi: 100 + Math.random() * 190, flo: 60 + Math.random() * 180,
            jitter: 0.001 + Math.random() * 0.029, jitterAbs: 0.00001 + Math.random() * 0.0002, rap: 0.001 + Math.random() * 0.02, ppq: 0.001 + Math.random() * 0.02, jitterDDP: 0.003 + Math.random() * 0.06,
            shimmer: 0.01 + Math.random() * 0.09, shimmerDb: 0.05 + Math.random() * 0.9, shimmerAPQ3: 0.005 + Math.random() * 0.05, shimmerAPQ5: 0.005 + Math.random() * 0.06, shimmerAPQ: 0.005 + Math.random() * 0.09, shimmerDDA: 0.015 + Math.random() * 0.15,
            nhr: 0.005 + Math.random() * 0.09, hnr: 8 + Math.random() * 25,
            rpde: 0.2 + Math.random() * 0.5, dfa: 0.5 + Math.random() * 0.4,
            spread1: -8 + Math.random() * 6, spread2: 0.05 + Math.random() * 0.4, d2: 1.5 + Math.random() * 2.0, ppe: 0.05 + Math.random() * 0.4
        };
    }
    
    // Animate sliders changing over 1 second instead of instant
    setParams(prev => {
        return {
            fo: parseFloat(mockValues.fo.toFixed(1)), fhi: parseFloat(mockValues.fhi.toFixed(1)), flo: parseFloat(mockValues.flo.toFixed(1)),
            jitter: parseFloat(mockValues.jitter.toFixed(5)), jitterAbs: parseFloat(mockValues.jitterAbs.toFixed(6)), rap: parseFloat(mockValues.rap.toFixed(5)), ppq: parseFloat(mockValues.ppq.toFixed(5)), jitterDDP: parseFloat(mockValues.jitterDDP.toFixed(5)),
            shimmer: parseFloat(mockValues.shimmer.toFixed(5)), shimmerDb: parseFloat(mockValues.shimmerDb.toFixed(4)), shimmerAPQ3: parseFloat(mockValues.shimmerAPQ3.toFixed(5)), shimmerAPQ5: parseFloat(mockValues.shimmerAPQ5.toFixed(5)), shimmerAPQ: parseFloat(mockValues.shimmerAPQ.toFixed(5)), shimmerDDA: parseFloat(mockValues.shimmerDDA.toFixed(5)),
            nhr: parseFloat(mockValues.nhr.toFixed(5)), hnr: parseFloat(mockValues.hnr.toFixed(2)),
            rpde: parseFloat(mockValues.rpde.toFixed(3)), dfa: parseFloat(mockValues.dfa.toFixed(3)),
            spread1: parseFloat(mockValues.spread1.toFixed(3)), spread2: parseFloat(mockValues.spread2.toFixed(3)), d2: parseFloat(mockValues.d2.toFixed(3)), ppe: parseFloat(mockValues.ppe.toFixed(3))
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
