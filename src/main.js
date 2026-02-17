import './style.css'

// Screens
const screens = {
  landing: document.getElementById('landing-screen'),
  scanning: document.getElementById('scanning-screen'),
  results: document.getElementById('results-screen')
};

// Elements
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const debugLog = document.getElementById('debug-log');

const resLevel = document.getElementById('res-level');
const resExplanation = document.getElementById('res-explanation');
const resAdvice = document.getElementById('res-advice');
const scalePointer = document.getElementById('scale-pointer');

// Buttons
const startScanInitBtn = document.getElementById('start-scan-init');
const stopScanBtn = document.getElementById('stop-scan-btn');
const backToScanBtn = document.getElementById('back-to-scan');
const countdownTimer = document.getElementById('countdown-timer');

// Constants
const HOLD_DURATION = 5000; // 5 seconds

// State
let isScanning = false;
let heldColor = null;
let holdStartTime = null;

function showScreen(screenKey) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screenKey].classList.add('active');

  // Reset timer UI if moving away from scanning
  if (screenKey !== 'scanning') {
    if (countdownTimer) countdownTimer.classList.remove('active');
    heldColor = null;
    holdStartTime = null;
  }
}

function log(msg) {
  console.log(msg);
  if (debugLog) {
    const line = document.createElement('div');
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    debugLog.appendChild(line);
    debugLog.scrollTop = debugLog.scrollHeight;
  }
}

const stressData = {
  Red: {
    level: "9.2",
    explanation: "ระดับความเครียดสูงมาก (High Stress Detected) พบคลื่นความพี่สีแดงที่บ่งบอกถึงความกดดันอย่างรุนแรง",
    advice: "• หยุดพักทันที 15-20 นาที\n• ทำสมาธิหรือฝึกลมหายใจช้าๆ\n• ดื่มน้ำเปล่าเพื่อปรับสมดุล\n• หลีกเลี่ยงหน้าจอหรืองานเร่งด่วน",
    scalePos: "90%"
  },
  Yellow: {
    level: "6.5",
    explanation: "ความเครียดสะสมปานกลาง (Moderate Stress) พลังงานมีความแปรปรวนแต่ยังควบคุมได้",
    advice: "• พักสายตา 5-10 นาที\n• ยืดเหยียดร่างกายเบาๆ\n• ฟังเพลงผ่อนคลาย\n• หาถั่วหรือผลไม้ทานเล่น",
    scalePos: "65%"
  },
  Green: {
    level: "4.2",
    explanation: "ร่างกายอยู่ในภาวะสมดุล (Balanced State) ระบบประสาทผ่อนคลายและพร้อมทำงาน",
    advice: "• รักษาสภาพแวดล้อมปัจจุบันไว้\n• ทำงานที่ใช้สมาธิต่อได้ดี\n• ยิ้มรับความสดชื่น",
    scalePos: "35%"
  },
  Blue: {
    level: "2.5",
    explanation: "ภาวะสงบนิ่งเป็นพิเศษ (Deep Calm) สภาวะจิตใจแจ่มใสและมั่นคงมาก",
    advice: "• เหมาะสำหรับการวางแผนระยะยาว\n• แบ่งปันพลังงานบวกให้คนรอบข้าง\n• จดบันทึกไอเดียดีๆ ที่เกิดขึ้น",
    scalePos: "15%"
  }
};

async function setupCamera() {
  log('Initializing camera...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        resolve();
      };
    });
  } catch (err) {
    log(`ERROR: ${err.name}`);
    alert('ไม่สามารถเข้าถึงกล้องได้: ' + err.message);
  }
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function detectColor(rgb) {
  const [h, s, l] = rgbToHsl(...rgb);
  if (s < 20 || l < 15 || l > 90) return null;
  if ((h >= 0 && h < 15) || (h > 330 && h <= 360)) return 'Red';
  if (h >= 45 && h < 75) return 'Yellow';
  if (h >= 90 && h < 160) return 'Green';
  if (h >= 180 && h < 260) return 'Blue';
  return null;
}

function processScan() {
  if (!isScanning) return;

  // Draw frame to canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Sample center pixel
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const colorName = detectColor([pixel[0], pixel[1], pixel[2]]);

  if (colorName && stressData[colorName]) {
    const now = Date.now();

    if (colorName !== heldColor) {
      // New color detected or changed - start/reset timer
      heldColor = colorName;
      holdStartTime = now;
      countdownTimer.classList.add('active');
      log(`Started holding: ${colorName}`);
    }

    const elapsed = now - holdStartTime;
    const remaining = Math.max(0, Math.ceil((HOLD_DURATION - elapsed) / 1000));

    countdownTimer.innerText = remaining;

    if (elapsed >= HOLD_DURATION) {
      // Success! Held for 5 seconds
      isScanning = false;
      countdownTimer.classList.remove('active');
      finalizeResults(colorName);
      return; // Stop the loop
    }
  } else {
    // No valid color detected - reset hold
    if (heldColor) {
      log('Color lost - resetting hold');
      heldColor = null;
      holdStartTime = null;
      countdownTimer.classList.remove('active');
    }
  }

  requestAnimationFrame(processScan);
}

function finalizeResults(colorName) {
  const data = stressData[colorName];
  resLevel.innerText = data.level;
  resExplanation.innerText = data.explanation;

  // Format advice
  resAdvice.innerHTML = data.advice.split('\n').map(l => `<p>${l}</p>`).join('');

  // Move scale pointer
  scalePointer.style.left = data.scalePos;

  stopCamera();
  showScreen('results');
}

function stopCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// Handlers
startScanInitBtn.addEventListener('click', async () => {
  await setupCamera();
  isScanning = true;
  showScreen('scanning');
  processScan();
});

stopScanBtn.addEventListener('click', () => {
  isScanning = false;
  stopCamera();
  showScreen('landing');
});

backToScanBtn.addEventListener('click', async () => {
  await setupCamera();
  isScanning = true;
  showScreen('scanning');
  processScan();
});
