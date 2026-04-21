/* ═══════════════════════════════════════════════════════════
   NEURAL SIMULATION CORE — Flask Edition
   Main application logic:
     • Dynamic slider controls
     • Three.js 3D brain sphere
     • Real-time prediction via Flask /predict endpoint
     • Web Audio microphone analysis
     • Simulation presets (high-risk / healthy)
   ═══════════════════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────────────
const state = {
  params: { fo: 154, jitter: 0.005, shimmer: 0.02, hnr: 21.0, rpde: 0.45, dfa: 0.72 },
  probability: 0,
  isAnalyzing: false,
  isSpeaking: false,
  predictionTimer: null,
};

const DEFAULTS = { fo: 154, jitter: 0.005, shimmer: 0.02, hnr: 21.0, rpde: 0.45, dfa: 0.72 };

// ── Slider Definitions ────────────────────────────────────
const SLIDERS = [
  { key: 'fo',      label: 'MDVP:Fo(Hz) [Fund. Freq]', icon: 'activity',   min: 80,    max: 260,  step: 1,     decimals: 0 },
  { key: 'jitter',  label: 'MDVP:Jitter(%)',            icon: 'mic',        min: 0.001, max: 0.03, step: 0.001, decimals: 3 },
  { key: 'shimmer', label: 'MDVP:Shimmer',              icon: 'mic',        min: 0.01,  max: 0.1,  step: 0.001, decimals: 3 },
  { key: 'hnr',     label: 'HNR [Harmonic-to-Noise]',   icon: 'zap',        min: 8,     max: 33,   step: 0.1,   decimals: 1 },
  { key: 'rpde',    label: 'RPDE [Recurrence Period]',   icon: 'activity',   min: 0.2,   max: 0.7,  step: 0.01,  decimals: 2 },
  { key: 'dfa',     label: 'DFA [Detrended Fluctuation]',icon: 'sliders-horizontal', min: 0.5, max: 0.9, step: 0.01, decimals: 2 },
];

// ══════════════════════════════════════════════════════════
//  1. BUILD SLIDERS
// ══════════════════════════════════════════════════════════
function buildSliders() {
  const container = document.getElementById('sliders-container');
  container.innerHTML = '';

  SLIDERS.forEach(s => {
    const group = document.createElement('div');
    group.className = 'control-group';
    group.innerHTML = `
      <div class="control-header">
        <label><i data-lucide="${s.icon}"></i> ${s.label}</label>
        <span class="slider-value" id="val-${s.key}">${state.params[s.key].toFixed(s.decimals)}</span>
      </div>
      <input type="range" class="slider-track" id="slider-${s.key}"
             min="${s.min}" max="${s.max}" step="${s.step}"
             value="${state.params[s.key]}" />
    `;
    container.appendChild(group);

    const input = group.querySelector('input');
    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.params[s.key] = val;
      document.getElementById(`val-${s.key}`).textContent = val.toFixed(s.decimals);
      schedulePredict();
      updateImpactBars();
    });
  });

  // Re-init lucide icons inside the new DOM
  if (window.lucide) lucide.createIcons();
}

// Sync slider DOM from state (used after simulation presets)
function syncSlidersFromState() {
  SLIDERS.forEach(s => {
    const input = document.getElementById(`slider-${s.key}`);
    const display = document.getElementById(`val-${s.key}`);
    if (input) input.value = state.params[s.key];
    if (display) display.textContent = state.params[s.key].toFixed(s.decimals);
  });
}

// ══════════════════════════════════════════════════════════
//  2. PREDICTION (call Flask /predict)
// ══════════════════════════════════════════════════════════
function schedulePredict() {
  clearTimeout(state.predictionTimer);
  state.predictionTimer = setTimeout(fetchPrediction, 300);
}

async function fetchPrediction() {
  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.params),
    });
    const data = await res.json();
    if (data.success) {
      animateScore(state.probability, parseFloat(data.probability.toFixed(1)));
      state.probability = parseFloat(data.probability.toFixed(1));
      updateResultsUI();
    } else {
      console.error('Backend error:', data.error);
    }
  } catch (err) {
    console.error('Failed to connect to Flask backend.', err);
  }
}

// Smooth counter animation
function animateScore(from, to) {
  const el = document.getElementById('score-value');
  const duration = 500;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
    const current = from + (to - from) * eased;
    el.textContent = current.toFixed(1);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateResultsUI() {
  const p = state.probability;
  const isHigh = p > 50;
  const box = document.getElementById('score-box');
  const icon = document.getElementById('score-icon');
  const status = document.getElementById('score-status');

  box.classList.toggle('high-risk', isHigh);

  // Swap icon
  icon.setAttribute('data-lucide', isHigh ? 'shield-alert' : 'shield-check');
  if (window.lucide) lucide.createIcons();

  status.textContent = isHigh ? 'HIGH PROBABILITY DETECTED' : 'PARAMETERS NORMAL';
}

function updateImpactBars() {
  const jitterBar  = document.getElementById('bar-jitter');
  const shimmerBar = document.getElementById('bar-shimmer');
  const hnrBar     = document.getElementById('bar-hnr');

  if (jitterBar)  jitterBar.style.width  = Math.min(state.params.jitter * 1000 * 3, 100) + '%';
  if (shimmerBar) shimmerBar.style.width  = Math.min(state.params.shimmer * 400 * 3, 100) + '%';
  if (hnrBar)     hnrBar.style.width     = Math.min((33 - state.params.hnr) * 3, 100) + '%';
}

// ══════════════════════════════════════════════════════════
//  3. THREE.JS — 3D Brain Sphere
// ══════════════════════════════════════════════════════════
let scene, camera, renderer, brainSphere, particles, clock;

function initThreeJS() {
  const container = document.getElementById('three-canvas');
  const w = container.clientWidth;
  const h = container.clientHeight;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const dirLight1 = new THREE.DirectionalLight(0xB026FF, 1.2);
  dirLight1.position.set(10, 10, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x00F0FF, 1.2);
  dirLight2.position.set(-10, -10, -5);
  scene.add(dirLight2);

  // Point lights for extra glow
  const pointLight1 = new THREE.PointLight(0x00F0FF, 0.6, 20);
  pointLight1.position.set(3, 3, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xB026FF, 0.6, 20);
  pointLight2.position.set(-3, -3, -3);
  scene.add(pointLight2);

  // Brain sphere (distorted icosahedron for organic look)
  const geometry = new THREE.IcosahedronGeometry(1.4, 12);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x00F0FF,
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.0,
    transparent: true,
    opacity: 0.92,
  });
  brainSphere = new THREE.Mesh(geometry, material);
  scene.add(brainSphere);

  // Store original vertex positions for distortion
  brainSphere.geometry.userData.originalPositions =
    brainSphere.geometry.attributes.position.array.slice();

  // Sparkle particles
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x00F0FF,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Orbit Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.update();

  // Clock
  clock = new THREE.Clock();

  // Resize handler
  window.addEventListener('resize', () => {
    const w2 = container.clientWidth;
    const h2 = container.clientHeight;
    camera.aspect = w2 / h2;
    camera.updateProjectionMatrix();
    renderer.setSize(w2, h2);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Rotate
    brainSphere.rotation.y = elapsed * 0.2;
    brainSphere.rotation.x = elapsed * 0.1;

    // Pulse scale
    const speaking = state.isSpeaking || state.isAnalyzing;
    const pulseFreq = speaking ? 10 : 2;
    const pulseAmp  = speaking ? 0.05 : 0.02;
    const s = 1 + Math.sin(elapsed * pulseFreq) * pulseAmp;
    brainSphere.scale.set(s, s, s);

    // Vertex distortion for organic effect
    const posAttr = brainSphere.geometry.attributes.position;
    const orig = brainSphere.geometry.userData.originalPositions;
    const distortAmt = speaking ? 0.12 : 0.05;
    const distortSpeed = speaking ? 4 : 2;
    for (let i = 0; i < posAttr.count; i++) {
      const ix = i * 3;
      const ox = orig[ix], oy = orig[ix + 1], oz = orig[ix + 2];
      const noise = Math.sin(ox * 3 + elapsed * distortSpeed) *
                    Math.cos(oy * 3 + elapsed * distortSpeed * 0.7) *
                    Math.sin(oz * 3 + elapsed * distortSpeed * 0.5) * distortAmt;
      posAttr.setXYZ(i, ox + ox * noise, oy + oy * noise, oz + oz * noise);
    }
    posAttr.needsUpdate = true;

    // Particle size
    particles.material.size = speaking ? 0.07 : 0.04;
    particles.material.opacity = speaking ? 0.8 : 0.5;
    particles.rotation.y = elapsed * 0.05;

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

// ══════════════════════════════════════════════════════════
//  4. WEB AUDIO — Live Microphone Analysis
// ══════════════════════════════════════════════════════════
let audioCtx, analyser, micStream, micSource, analysisRAF;

function stopLiveAnalysis() {
  if (analysisRAF) cancelAnimationFrame(analysisRAF);
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
  state.isAnalyzing = false;
  state.isSpeaking = false;
  updateVoiceBarUI(false);
}

async function startLiveAnalysis() {
  if (state.isAnalyzing) return;

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    micSource = audioCtx.createMediaStreamSource(micStream);
    micSource.connect(analyser);

    state.isAnalyzing = true;
    state.isSpeaking = true;
    updateVoiceBarUI(true);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let pitchSamples = [], ampSamples = [];

    function analyze() {
      analyser.getByteTimeDomainData(dataArray);
      let sumSquares = 0, zeroCrossings = 0, prev = 128;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        const norm = (val - 128) / 128;
        sumSquares += norm * norm;
        if (val >= 128 && prev < 128) zeroCrossings++;
        prev = val;
      }

      const rms = Math.sqrt(sumSquares / bufferLength);
      const pitchApprox = (zeroCrossings * audioCtx.sampleRate) / (2 * bufferLength);

      if (rms > 0.01) {
        pitchSamples.push(pitchApprox);
        ampSamples.push(rms);
      }

      analysisRAF = requestAnimationFrame(analyze);
    }

    analyze();

    // Stop after 5 seconds
    setTimeout(() => {
      stopLiveAnalysis();

      if (pitchSamples.length > 10) {
        let pitchDiffs = 0, pitchSum = 0;
        for (let i = 0; i < pitchSamples.length; i++) {
          pitchSum += pitchSamples[i];
          if (i > 0) pitchDiffs += Math.abs(pitchSamples[i] - pitchSamples[i - 1]);
        }
        const avgPitch = pitchSum / pitchSamples.length;
        const mockJitter = (pitchDiffs / (pitchSamples.length - 1)) / avgPitch;

        let ampDiffs = 0, ampSum = 0;
        for (let i = 0; i < ampSamples.length; i++) {
          ampSum += ampSamples[i];
          if (i > 0) ampDiffs += Math.abs(ampSamples[i] - ampSamples[i - 1]);
        }
        const avgAmp = ampSum / ampSamples.length;
        const mockShimmer = (ampDiffs / (ampSamples.length - 1)) / avgAmp;

        const finalJitter  = Math.min(Math.max(mockJitter * 0.02, 0.001), 0.03);
        const finalShimmer = Math.min(Math.max(mockShimmer * 0.03, 0.01), 0.1);
        const finalHNR     = Math.min(Math.max(33 - (mockJitter * 20) - (mockShimmer * 5), 8), 33);
        const finalFo      = (!isNaN(avgPitch) && avgPitch >= 50 && avgPitch <= 300) ? Math.round(avgPitch) : state.params.fo;

        state.params.fo      = finalFo;
        state.params.jitter  = parseFloat(finalJitter.toFixed(5));
        state.params.shimmer = parseFloat(finalShimmer.toFixed(5));
        state.params.hnr     = parseFloat(finalHNR.toFixed(2));

        syncSlidersFromState();
        updateImpactBars();
        schedulePredict();
      } else {
        console.log('Not enough audio detected.');
      }
    }, 5000);

  } catch (err) {
    console.error('Microphone access denied or error:', err);
    state.isAnalyzing = false;
    state.isSpeaking = false;
    updateVoiceBarUI(false);
  }
}

function updateVoiceBarUI(analyzing) {
  const inner  = document.querySelector('.voice-bar-inner');
  const btn    = document.getElementById('btn-mic');
  const label  = document.getElementById('voice-label');
  const status = document.getElementById('voice-status');

  inner.classList.toggle('active', analyzing);
  btn.classList.toggle('active', analyzing);

  if (analyzing) {
    label.textContent  = 'Extracting Vocal Markers...';
    status.textContent = 'Analyzing 5-second sample...';
    status.classList.add('analyzing');
  } else {
    label.textContent  = 'Live Web Audio Diagnostic';
    status.textContent = 'Press Mic & read a short sentence.';
    status.classList.remove('analyzing');
  }
}

// ══════════════════════════════════════════════════════════
//  5. SIMULATION PRESETS
// ══════════════════════════════════════════════════════════
function generateFakeData(type) {
  state.isSpeaking = true;
  let m = {};

  if (type === 'parkinson') {
    m = {
      fo:      +(120 + Math.random() * 40).toFixed(1),
      jitter:  +(0.015 + Math.random() * 0.015).toFixed(5),
      shimmer: +(0.05 + Math.random() * 0.05).toFixed(5),
      hnr:     +(8 + Math.random() * 12).toFixed(2),
      rpde:    +(0.5 + Math.random() * 0.2).toFixed(3),
      dfa:     +(0.7 + Math.random() * 0.2).toFixed(3),
    };
  } else {
    m = {
      fo:      +(150 + Math.random() * 50).toFixed(1),
      jitter:  +(0.001 + Math.random() * 0.005).toFixed(5),
      shimmer: +(0.01 + Math.random() * 0.02).toFixed(5),
      hnr:     +(25 + Math.random() * 8).toFixed(2),
      rpde:    +(0.2 + Math.random() * 0.2).toFixed(3),
      dfa:     +(0.5 + Math.random() * 0.15).toFixed(3),
    };
  }

  Object.assign(state.params, m);
  syncSlidersFromState();
  updateImpactBars();
  schedulePredict();

  setTimeout(() => { state.isSpeaking = false; }, 1500);
}

// ══════════════════════════════════════════════════════════
//  6. EXPORT REPORT
// ══════════════════════════════════════════════════════════
function exportReport() {
  const p = state.params;
  const prob = state.probability;
  const risk = prob > 50 ? 'HIGH RISK' : 'NORMAL';
  const now = new Date().toLocaleString();

  const report = `
╔══════════════════════════════════════════════════════════╗
║         PARKINSON'S ANN — SIMULATION REPORT             ║
╠══════════════════════════════════════════════════════════╣
║  Generated : ${now.padEnd(40)}║
║  Status    : ${risk.padEnd(40)}║
╠══════════════════════════════════════════════════════════╣
║  PREDICTION SCORE : ${(prob.toFixed(1) + '%').padEnd(34)}║
╠══════════════════════════════════════════════════════════╣
║  PARAMETERS                                             ║
║  ─────────────────────────────────────────────           ║
║  MDVP:Fo(Hz)     : ${String(p.fo).padEnd(35)}║
║  MDVP:Jitter(%)  : ${String(p.jitter).padEnd(35)}║
║  MDVP:Shimmer    : ${String(p.shimmer).padEnd(35)}║
║  HNR              : ${String(p.hnr).padEnd(34)}║
║  RPDE             : ${String(p.rpde).padEnd(34)}║
║  DFA              : ${String(p.dfa).padEnd(34)}║
╚══════════════════════════════════════════════════════════╝
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parkinson_report_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════
//  7. INIT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Build UI
  buildSliders();
  updateImpactBars();

  // Init Lucide icons
  if (window.lucide) lucide.createIcons();

  // Init Three.js
  initThreeJS();

  // Wire buttons
  document.getElementById('btn-sim-high').addEventListener('click', () => generateFakeData('parkinson'));
  document.getElementById('btn-sim-normal').addEventListener('click', () => generateFakeData('healthy'));
  document.getElementById('btn-reset').addEventListener('click', () => {
    Object.assign(state.params, { ...DEFAULTS });
    syncSlidersFromState();
    updateImpactBars();
    schedulePredict();
  });
  document.getElementById('btn-mic').addEventListener('click', startLiveAnalysis);
  document.getElementById('btn-export').addEventListener('click', exportReport);

  // Initial prediction
  fetchPrediction();
});
