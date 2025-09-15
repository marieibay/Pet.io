import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PetState, Food, Bubble, Poop, Sprite, Mood, Ripple, Activity, Decoration } from './types';
import Header from './components/Header';
import StatusBar from './components/StatusBar';

// --- GAME LOGIC & STATE ---
const WATER_LEVEL = 1.0;
const SAND_HEIGHT = 20;
const SAVE_KEY = 'petio_save_data';


// --- ART ASSETS & RENDERING ---

const makeSprite = (): { img: HTMLImageElement, fw: number, fh: number } => {
  const fw = 32, fh = 32, cols = 3, rows = 4;
  const off = document.createElement('canvas');
  off.width = fw * cols;
  off.height = fh * rows * 2; // Increased height for 2 fish types
  const p = off.getContext('2d');
  if (!p) throw new Error("Could not create 2d context for sprite");
  p.imageSmoothingEnabled = false;

  function rect(x0: number, y0: number, x1: number, y1: number, c: string, px: number, py: number) {
    p.fillStyle = c;
    p.fillRect(px + x0, py + y0, (x1 - x0 + 1), (y1 - y0 + 1));
  }
  function dot(x: number, y: number, c: string, px: number, py: number) {
    rect(x, y, x, y, c, px, py);
  }

  function drawFish(px: number, py: number, mood: Mood, view: 'side' | 'three_quarter' | 'front') {
    let blue = '#3c5a91', blue_dark = '#2c4a71',
        orange = '#ed6321', orange_dark = '#b3511d', orange_light = '#ff8840',
        white = '#f5f5f5', white_shadow = '#dcdcdc',
        eyeW = '#fafafa', eyeB = '#0f0f14', eye_highlight = '#ffffff';

    if (mood === 'sick') {
      blue = '#3a4e7a'; blue_dark = '#2a3e6a';
      orange = '#c75a1f'; orange_dark = '#a54b19'; orange_light = '#e57a3b';
      white = '#e8f1f1'; white_shadow = '#c1c8c8'; eyeW = '#e8f1f1';
    }
    if (mood === 'sos') {
      blue = '#543c53'; blue_dark = '#442c43';
      orange = '#b33c2b'; orange_dark = '#923123'; orange_light = '#d45b48';
      white = '#f0dede'; white_shadow = '#c4b8b8'; eyeW = '#f0dede';
    }
    
    const dx = (mood === 'happy') ? 1 : (mood === 'ok') ? 0 : -1;
    const dy = (mood === 'happy' || mood === 'ok' || mood === 'sick') ? 1 : 0;

    if (view === 'side') {
      rect(8, 13, 22, 18, orange, px, py); rect(9, 11, 21, 12, orange_light, px, py); dot(22, 12, orange_light, px, py); rect(9, 19, 21, 19, orange_dark, px, py); dot(8, 18, orange_dark, px, py); dot(22, 18, orange_dark, px, py);
      rect(11, 11, 11, 18, white, px, py); rect(10, 11, 10, 18, eyeB, px, py); rect(12, 11, 12, 18, eyeB, px, py); rect(10, 19, 12, 20, white_shadow, px, py);
      rect(17, 11, 17, 18, white, px, py); rect(16, 11, 16, 18, eyeB, px, py); rect(18, 11, 18, 18, eyeB, px, py); rect(16, 19, 18, 20, white_shadow, px, py);
      rect(4, 14, 6, 17, orange, px, py); dot(4, 13, orange_light, px, py); dot(4, 18, orange_dark, px, py);
      dot(8, 10, blue, px, py); dot(10, 10, blue, px, py); dot(16, 10, blue, px, py); dot(19, 10, blue, px, py);
      rect(3, 13, 4, 18, blue_dark, px, py);
      dot(7, 20, blue_dark, px, py); dot(9, 21, blue_dark, px, py); dot(18, 21, blue_dark, px, py);
      rect(21, 13, 23, 15, eyeW, px, py); dot(22 + dx, 14 + dy, eyeB, px, py); dot(21, 13, eye_highlight, px, py);
      rect(12, 9, 14, 10, orange_light, px, py); rect(12, 21, 14, 22, orange_dark, px, py);
    } else if (view === 'three_quarter') {
      rect(10, 13, 20, 18, orange, px, py); rect(11, 11, 19, 12, orange_light, px, py); rect(11, 19, 19, 19, orange_dark, px, py);
      rect(13, 11, 13, 18, white, px, py); rect(12, 11, 12, 18, eyeB, px, py); rect(12, 19, 13, 20, white_shadow, px, py);
      rect(17, 11, 17, 18, white, px, py); rect(16, 11, 16, 18, eyeB, px, py); rect(16, 19, 17, 20, white_shadow, px, py);
      rect(8, 14, 9, 17, orange, px, py); dot(8, 13, orange_light, px, py); dot(8, 18, orange_dark, px, py);
      dot(10, 10, blue, px, py); dot(16, 10, blue, px, py);
      rect(7, 13, 8, 18, blue_dark, px, py);
      dot(9, 20, blue_dark, px, py); dot(11, 21, blue_dark, px, py); dot(17, 21, blue_dark, px, py);
      rect(19, 13, 21, 15, eyeW, px, py); dot(20 + dx, 14 + dy, eyeB, px, py); dot(19, 13, eye_highlight, px, py);
      rect(13, 9, 14, 10, orange_light, px, py); rect(13, 21, 14, 22, orange_dark, px, py);
    } else if (view === 'front') {
      rect(14, 11, 17, 20, orange, px, py); rect(13, 12, 13, 19, orange, px, py); rect(18, 12, 18, 19, orange, px, py);
      rect(14, 11, 17, 11, orange_light, px, py); rect(14, 20, 17, 20, orange_dark, px, py);
      rect(14, 11, 17, 12, white, px, py); rect(14, 18, 17, 19, white, px, py); rect(14, 19, 17, 20, white_shadow, px, py);
      rect(14, 10, 17, 10, blue, px, py); rect(14, 21, 17, 21, blue_dark, px, py);
      dot(13, 11, blue, px, py); dot(12, 12, blue, px, py); dot(12, 19, blue_dark, px, py); dot(13, 20, blue_dark, px, py);
      dot(18, 11, blue, px, py); dot(19, 12, blue, px, py); dot(19, 19, blue_dark, px, py); dot(18, 20, blue_dark, px, py);
      rect(12, 13, 13, 15, eyeW, px, py); rect(18, 13, 19, 15, eyeW, px, py);
      const pupilY = (mood === 'sick' || mood === 'sos') ? 14 : 15;
      dot(13, pupilY, eyeB, px, py); dot(18, pupilY, eyeB, px, py);
      dot(12, 13, eye_highlight, px, py); dot(18, 13, eye_highlight, px, py);
      rect(10, 15, 11, 16, orange_light, px, py); rect(20, 15, 21, 16, orange_light, px, py);
      if (mood === 'happy') { rect(15, 19, 16, 19, eyeB, px, py); }
      else if (mood === 'ok') { rect(15, 19, 16, 19, eyeB, px, py); dot(15,18,eyeB,px,py); dot(16,18,eyeB,px,py); }
    }
  }

  function drawBasslet(px: number, py: number, mood: Mood, view: 'side' | 'three_quarter' | 'front') {
    let purple = '#9b59b6', purple_dark = '#8e44ad', purple_light = '#af7ac5',
        yellow = '#f1c40f', yellow_dark = '#f39c12', yellow_light = '#f4d03f',
        eyeW = '#fafafa', eyeB = '#0f0f14', eye_highlight = '#ffffff';

    if (mood === 'sick') {
      purple = '#8c50a3'; purple_dark = '#7d3a98'; purple_light = '#9d6ab0';
      yellow = '#d9b00d'; yellow_dark = '#da8b11'; yellow_light = '#dcc13a';
      eyeW = '#e8f1f1';
    }
    if (mood === 'sos') {
      purple = '#7c4c87'; purple_dark = '#6e357d'; purple_light = '#8c6096';
      yellow = '#c29d0c'; yellow_dark = '#c27e10'; yellow_light = '#c5ae35';
      eyeW = '#f0dede';
    }
    
    const dx = (mood === 'happy') ? 1 : (mood === 'ok') ? 0 : -1;
    const dy = (mood === 'happy' || mood === 'ok' || mood === 'sick') ? 1 : 0;

    if (view === 'side') {
      rect(8, 13, 15, 18, yellow, px, py); rect(16, 13, 22, 18, purple, px, py);
      rect(9, 11, 15, 12, yellow_light, px, py); rect(16, 11, 21, 12, purple_light, px, py); dot(22, 12, purple_light, px, py);
      rect(9, 19, 15, 19, yellow_dark, px, py); rect(16, 19, 21, 19, purple_dark, px, py); dot(8, 18, yellow_dark, px, py); dot(22, 18, purple_dark, px, py);
      rect(4, 14, 6, 17, yellow, px, py); dot(4, 13, yellow_light, px, py); dot(4, 18, yellow_dark, px, py);
      rect(21, 13, 23, 15, eyeW, px, py); dot(22 + dx, 14 + dy, eyeB, px, py); dot(21, 13, eye_highlight, px, py);
      rect(12, 9, 14, 10, purple_light, px, py);
      dot(13, 9, eyeB, px, py);
      rect(12, 21, 14, 22, purple_dark, px, py);
    } else if (view === 'three_quarter') {
      rect(10, 13, 15, 18, yellow, px, py); rect(16, 13, 20, 18, purple, px, py);
      rect(11, 11, 15, 12, yellow_light, px, py); rect(16, 11, 19, 12, purple_light, px, py);
      rect(11, 19, 15, 19, yellow_dark, px, py); rect(16, 19, 19, 19, purple_dark, px, py);
      rect(8, 14, 9, 17, yellow, px, py); dot(8, 13, yellow_light, px, py); dot(8, 18, yellow_dark, px, py);
      rect(19, 13, 21, 15, eyeW, px, py); dot(20 + dx, 14 + dy, eyeB, px, py); dot(19, 13, eye_highlight, px, py);
      rect(13, 9, 14, 10, purple_light, px, py);
      dot(13, 9, eyeB, px, py);
      rect(13, 21, 14, 22, purple_dark, px, py);
    } else if (view === 'front') {
      rect(14, 11, 17, 20, purple, px, py); rect(13, 12, 13, 19, purple, px, py); rect(18, 12, 18, 19, purple, px, py);
      rect(14, 11, 17, 11, purple_light, px, py); rect(14, 20, 17, 20, purple_dark, px, py);
      rect(10, 15, 11, 16, purple_light, px, py); rect(20, 15, 21, 16, purple_light, px, py);
      rect(12, 13, 13, 15, eyeW, px, py); rect(18, 13, 19, 15, eyeW, px, py);
      const pupilY = (mood === 'sick' || mood === 'sos') ? 14 : 15;
      dot(13, pupilY, eyeB, px, py); dot(18, pupilY, eyeB, px, py);
      dot(12, 13, eye_highlight, px, py); dot(18, 13, eye_highlight, px, py);
      if (mood === 'happy') { rect(15, 19, 16, 19, eyeB, px, py); }
      else if (mood === 'ok') { rect(15, 19, 16, 19, eyeB, px, py); dot(15,18,eyeB,px,py); dot(16,18,eyeB,px,py); }
    }
  }
  
  const moods: Mood[] = ['sos', 'sick', 'ok', 'happy'];
  const views: ('side' | 'three_quarter' | 'front')[] = ['side', 'three_quarter', 'front'];
  
  for (let r = 0; r < moods.length; r++) {
      for (let c = 0; c < views.length; c++) {
          drawFish(c * fw, r * fh, moods[r], views[c]);
          drawBasslet(c * fw, (r + 4) * fh, moods[r], views[c]);
      }
  }

  const img = new Image();
  img.src = off.toDataURL('image/png');
  return { img, fw, fh };
};

const useFishSprite = (): Sprite => {
  const spriteData = useMemo(() => makeSprite(), []);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (spriteData.img?.complete) {
      setIsReady(true);
    } else if (spriteData.img) {
      spriteData.img.onload = () => setIsReady(true);
    }
  }, [spriteData.img]);

  return { ...spriteData, isReady };
};

function drawPet(ctx: CanvasRenderingContext2D, pet: PetState, sprite: Sprite, canvas: HTMLCanvasElement) {
  if (!sprite.isReady || !sprite.img) return;

  const rowMap: Record<Mood, number> = { sos: 0, sick: 1, ok: 2, happy: 3 };
  const moodRow = rowMap[pet.mood] ?? 3;

  const typeOffset = pet.type === 'basslet' ? 4 : 0;
  const row = moodRow + typeOffset;
  
  const absFacing = Math.abs(pet.facing);
  let col = 0;
  if (absFacing < 0.33) col = 2;
  else if (absFacing < 0.8) col = 1;
  else col = 0;

  const flip = pet.facing < 0;
  const desired = Math.min(120, Math.max(80, canvas.width * 0.3));
  const scale = (desired / sprite.fw) * pet.scale;

  const ampMap: Record<Mood, number> = { happy: 1.5, ok: 1.0, sick: 0.6, sos: 0.2 };
  const amp = ampMap[pet.mood] ?? 1.0;
  const bob = Math.sin((performance.now() * 0.001) + pet.phase) * amp;

  ctx.save();
  ctx.translate(pet.x, pet.y + bob);
  if (!pet.isAlive) ctx.rotate(Math.PI);
  ctx.rotate(pet.rotation);
  if (flip && col !== 2) ctx.scale(-1, 1);
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite.img, col * sprite.fw, row * sprite.fh, sprite.fw, sprite.fh, -sprite.fw / 2, -sprite.fh / 2, sprite.fw, sprite.fh);
  ctx.restore();
}

function drawBubbles(ctx: CanvasRenderingContext2D, bubbles: Bubble[]) {
  ctx.save();
  for (const b of bubbles) {
    ctx.globalAlpha = b.a;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(191, 230, 255, 0.5)';
    ctx.fill();
  }
  ctx.restore();
}

function drawFood(ctx: CanvasRenderingContext2D, foods: Food[]) {
    ctx.save();
    for (const food of foods) {
        ctx.globalAlpha = Math.min(1, food.life / 10);
        ctx.fillStyle = food.color;
        ctx.beginPath();
        ctx.arc(food.x, food.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawPoops(ctx: CanvasRenderingContext2D, poops: Poop[]) {
    ctx.save();
    ctx.fillStyle = '#654321';
    for (const p of poops) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawRipples(ctx: CanvasRenderingContext2D, ripples: Ripple[]) {
  ctx.save();
  for (const ripple of ripples) {
    ctx.globalAlpha = ripple.life;
    ctx.strokeStyle = `rgba(191, 230, 255, ${ripple.life})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawToy(ctx: CanvasRenderingContext2D, toy: {x: number, y: number}) {
    ctx.save();
    ctx.fillStyle = '#f94144';
    ctx.beginPath();
    ctx.arc(toy.x, toy.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(toy.x - 2, toy.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawLightStreaks(ctx: CanvasRenderingContext2D, time: number, waterTopPx: number) {
    const canvas = ctx.canvas;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const beams = [
        { x: canvas.width * 0.1, angle: -0.15, width: 60, alpha: 0.07 },
        { x: canvas.width * 0.35, angle: 0.0, width: 100, alpha: 0.1 },
        { x: canvas.width * 0.6, angle: 0.1, width: 80, alpha: 0.09 },
        { x: canvas.width * 0.9, angle: 0.2, width: 70, alpha: 0.08 },
    ];

    beams.forEach((beam, i) => {
        const sway = Math.sin(time / 5000 + i * 2.1) * 60;
        const alphaFlicker = (Math.sin(time / 1500 + i * 1.5) + 1) / 2 * 0.6 + 0.4;

        ctx.save();
        ctx.translate(beam.x + sway, 0);
        ctx.rotate(beam.angle);

        const gradient = ctx.createLinearGradient(0, waterTopPx, 0, canvas.height);
        gradient.addColorStop(0, `rgba(255, 255, 230, ${beam.alpha * alphaFlicker})`);
        gradient.addColorStop(1, `rgba(255, 255, 230, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-beam.width, waterTopPx - 10);
        ctx.lineTo(beam.width, waterTopPx - 10);
        ctx.lineTo(beam.width + 200, canvas.height);
        ctx.lineTo(-beam.width - 200, canvas.height);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    });

    ctx.restore();
}

function drawCleaningHand(ctx: CanvasRenderingContext2D, progress: number) {
    const canvas = ctx.canvas;
    ctx.save();

    // Easing for smooth start and end
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easedProgress = easeInOutCubic(progress);

    let handX, handY;
    const sweepY1 = canvas.height * 0.3;
    const sweepY2 = canvas.height * 0.65;
    const handEntryExitY = -150; // Start and end off-screen (relative to scaled size)
    const handVisualWidth = 150; // Estimated width for side padding

    // Animate Y position: down, stay, down, stay, up
    if (easedProgress < 0.15) { // Enter
        const phaseProgress = easedProgress / 0.15;
        handY = handEntryExitY + (sweepY1 - handEntryExitY) * phaseProgress;
    } else if (easedProgress < 0.45) { // Sweep 1
        handY = sweepY1;
    } else if (easedProgress < 0.55) { // Move to sweep 2
        const phaseProgress = (easedProgress - 0.45) / 0.1;
        handY = sweepY1 + (sweepY2 - sweepY1) * phaseProgress;
    } else if (easedProgress < 0.85) { // Sweep 2
        handY = sweepY2;
    } else { // Exit
        const phaseProgress = (easedProgress - 0.85) / 0.15;
        handY = sweepY2 + (handEntryExitY - sweepY2) * phaseProgress;
    }

    // Animate X position: center, sweep right, sweep left, center
    if (easedProgress < 0.15) { // Centered on entry
        handX = canvas.width / 2;
    } else if (easedProgress < 0.45) { // Sweep 1 (L to R)
        const phaseProgress = (easedProgress - 0.15) / 0.3;
        handX = (handVisualWidth / 2) + (canvas.width - handVisualWidth) * phaseProgress;
    } else if (easedProgress < 0.55) { // Hold position while moving down
        handX = canvas.width - (handVisualWidth / 2);
    } else if (easedProgress < 0.85) { // Sweep 2 (R to L)
        const phaseProgress = (easedProgress - 0.55) / 0.3;
        handX = (canvas.width - handVisualWidth / 2) - (canvas.width - handVisualWidth) * phaseProgress;
    } else { // Almost centered on exit
        const phaseProgress = (easedProgress - 0.85) / 0.15;
        handX = (handVisualWidth / 2) + (canvas.width / 2 - handVisualWidth / 2) * (1 - phaseProgress);
    }

    ctx.translate(handX, handY);

    // Bigger and longer arm. Scale everything up.
    const scale = Math.max(1.5, canvas.height / 350); // Scale based on canvas height
    ctx.scale(scale, scale);

    // Rotate to point down, with a slight sway during sweeps
    let rotation = Math.PI / 2;
    if (easedProgress >= 0.15 && easedProgress < 0.45) {
        rotation += (easedProgress - 0.3) * 0.5;
    } else if (easedProgress >= 0.55 && easedProgress < 0.85) {
        rotation -= (easedProgress - 0.7) * 0.5;
    }
    ctx.rotate(rotation);

    // --- Draw Arm --- (Modified to be much longer)
    // The arm graphic is drawn extending to the left (-x), so after rotation it extends up (-y)
    ctx.fillStyle = '#d3a37c'; // Skin tone for the arm
    ctx.beginPath();
    ctx.moveTo(-30, -20); // Connects to the back of the hand
    // Use canvas height to ensure it always goes off-screen
    const armDrawLength = (canvas.height / scale) + 200;
    ctx.lineTo(-armDrawLength, -35); // Tapers towards off-screen, MUCH longer
    ctx.lineTo(-armDrawLength, 35);
    ctx.lineTo(-30, 20);
    ctx.closePath();
    ctx.fill();

    // --- Draw Hand --- (Original code, just transformed now)
    ctx.fillStyle = '#f2d5b1'; // Lighter skin tone for the hand
    ctx.beginPath();
    ctx.arc(0, 0, 30, -Math.PI / 1.8, Math.PI / 1.8, false); // Curved fingers
    ctx.lineTo(-30, 25); // Bottom of the palm
    ctx.lineTo(-30, -25); // Top of the palm
    ctx.closePath();
    ctx.fill();
    
    // Thumb
    ctx.beginPath();
    ctx.moveTo(-15, -25);
    ctx.quadraticCurveTo(20, -45, 35, -20);
    ctx.closePath();
    ctx.fill();

    // --- Draw Sponge ---
    ctx.fillStyle = '#fffb96'; // Yellow sponge color
    ctx.beginPath();
    if (ctx.roundRect) {
         ctx.roundRect(15, -45, 40, 90, 8);
    } else {
        ctx.rect(15, -45, 40, 90);
    }
    ctx.fill();
    
    // --- Draw Suds --- (also transformed)
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 5; i++) {
        const offsetX = -20 + Math.random() * 80;
        const offsetY = (Math.random() - 0.5) * 110;
        const radius = Math.random() * 10 + 5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - (Math.random() * 0.3)})`;
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// --- AUDIO ---

const beep = (freq: number, time: number, type: OscillatorType, vol = 0.3) => (ac: AudioContext, now: number) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + time);
    o.connect(g).connect(ac.destination);
    o.start(now);
    o.stop(now + time + 0.02);
};

const useAudio = (isMuted: boolean) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const whiteNoiseBufferRef = useRef<AudioBuffer | null>(null);

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ac;
        
        const bufferSize = ac.sampleRate * 0.7; // Long enough for swish sound
        const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        whiteNoiseBufferRef.current = buffer;

      } catch (e) { console.error("Web Audio API is not supported"); }
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((...soundFns: ((ac: AudioContext, time: number) => void)[]) => {
      if (isMuted) return;
      const ac = ensureAudioContext();
      if (!ac || ac.state !== 'running') return;
      soundFns.forEach(fn => fn(ac, ac.currentTime));
  }, [ensureAudioContext, isMuted]);

  const playFeed = useCallback(() => playSound(beep(440, 0.2, 'square', 0.1)), [playSound]);
  const playPlay = useCallback(() => playSound(beep(660, 0.15, 'sine', 0.1)), [playSound]);
  
  const playClean = useCallback(() => {
    if (isMuted) return;
    const ac = ensureAudioContext();
    if (!ac || ac.state !== 'running' || !whiteNoiseBufferRef.current) return;
    const now = ac.currentTime;
    const totalDuration = 2.5;

    // --- Sloshing Sound ---
    [0, 0.3].forEach(startTime => {
        const sloshNode = ac.createBufferSource();
        sloshNode.buffer = whiteNoiseBufferRef.current;
        const lowpass = ac.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(600, now + startTime);
        lowpass.frequency.exponentialRampToValueAtTime(300, now + startTime + 0.2);
        const sloshGain = ac.createGain();
        sloshGain.gain.setValueAtTime(0, now + startTime);
        sloshGain.gain.linearRampToValueAtTime(0.2, now + startTime + 0.02);
        sloshGain.gain.exponentialRampToValueAtTime(0.0001, now + startTime + 0.3);
        sloshNode.connect(lowpass).connect(sloshGain).connect(ac.destination);
        sloshNode.start(now + startTime);
        sloshNode.stop(now + startTime + 0.4);
    });

    // --- Scrubbing Sound ---
    const scrubNode = ac.createBufferSource();
    scrubNode.buffer = whiteNoiseBufferRef.current;
    scrubNode.loop = true;
    const bandpass = ac.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 4;
    bandpass.frequency.setValueAtTime(800, now);
    bandpass.frequency.linearRampToValueAtTime(2000, now + totalDuration);
    const scrubGain = ac.createGain();
    const scrubStart = now + 0.1;
    const scrubDuration = totalDuration - 0.2;
    const curvePoints = 64;
    const curve = new Float32Array(curvePoints);
    const numScrubs = 8;
    for (let i = 0; i < curvePoints; i++) {
        curve[i] = 0.15 * Math.pow(Math.sin((i / (curvePoints - 1)) * Math.PI * numScrubs), 2);
    }
    scrubGain.gain.setValueAtTime(0, now);
    scrubGain.gain.linearRampToValueAtTime(0.1, scrubStart);
    scrubGain.gain.setValueCurveAtTime(curve, scrubStart, scrubDuration);
    scrubGain.gain.linearRampToValueAtTime(0, scrubStart + scrubDuration + 0.1);
    scrubNode.connect(bandpass).connect(scrubGain).connect(ac.destination);
    scrubNode.start(now);
    scrubNode.stop(now + totalDuration);
  }, [ensureAudioContext, isMuted]);

  const playPoke = useCallback(() => playSound(beep(200, 0.15, 'sawtooth', 0.2)), [playSound]);
  const playToySqueak = useCallback(() => playSound(beep(1200, 0.1, 'sine', 0.2)), [playSound]);
  
  const playPlop = useCallback(() => {
    const ac = ensureAudioContext();
    if (!ac || isMuted || ac.state !== 'running' || !whiteNoiseBufferRef.current) return;
    const now = ac.currentTime;
    
    const source = ac.createBufferSource();
    source.buffer = whiteNoiseBufferRef.current;
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400 + Math.random() * 200;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    source.connect(filter).connect(gain).connect(ac.destination);
    source.start(now);
    source.stop(now + 0.1);
  }, [ensureAudioContext, isMuted]);

  const playEat = useCallback(() => {
     const ac = ensureAudioContext();
     if (!ac || ac.state !== 'running' || isMuted) return;
     const now = ac.currentTime;
     const bufferSize = ac.sampleRate * 0.1;
     const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
     const output = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.4;
     const noise = ac.createBufferSource();
     noise.buffer = buffer;
     const bandpass = ac.createBiquadFilter();
     bandpass.type = 'bandpass';
     bandpass.frequency.setValueAtTime(1500, now);
     bandpass.Q.value = 1.5;
     const noiseGain = ac.createGain();
     noiseGain.gain.setValueAtTime(0, now);
     noiseGain.gain.linearRampToValueAtTime(0.7, now + 0.01);
     noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
     noise.connect(bandpass).connect(noiseGain).connect(ac.destination);
     noise.start(now);
     noise.stop(now + 0.1);
  }, [ensureAudioContext, isMuted]);
  
  const playSwish = useCallback(() => {
    if (isMuted) return;
    const ac = ensureAudioContext();
    if (!ac || ac.state !== 'running' || !whiteNoiseBufferRef.current) return;
    const now = ac.currentTime;
    
    const noise = ac.createBufferSource();
    noise.buffer = whiteNoiseBufferRef.current;
    
    const bandpass = ac.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 2;
    bandpass.frequency.setValueAtTime(400, now);
    bandpass.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    bandpass.frequency.exponentialRampToValueAtTime(600, now + 0.6);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    noise.connect(bandpass).connect(gain).connect(ac.destination);
    noise.start(now);
    noise.stop(now + 0.7);
  }, [ensureAudioContext, isMuted]);

  const unlockAudio = useCallback(() => {
    const ac = ensureAudioContext();
    if (ac && ac.state === 'suspended') {
      ac.resume();
    }
  }, [ensureAudioContext]);

  return useMemo(() => ({
    playFeed, playPlay, playClean, playPoke, playEat, unlockAudio, playToySqueak, playSwish, playPlop
  }), [playFeed, playPlay, playClean, playPoke, playEat, unlockAudio, playToySqueak, playSwish, playPlop]);
};

const createPet = (id: number, scale: number, name: string, canvas: HTMLCanvasElement, type: 'clownfish' | 'basslet'): PetState => {
  const now = Date.now();
  return {
    id, name, scale, type,
    age: 0, hunger: 80, happiness: 80, health: 100,
    cleanliness: 100, energy: 80, mood: 'happy', activity: 'idle',
    lastFed: now, lastPlayed: now, lastCleaned: now, lastSlept: now, lastBubbleAt: 0, lastAteAt: 0, lastToyInteraction: 0,
    isAlive: true, isSleeping: false, sleepProgress: 0,
    x: (canvas.width / 2) + (id - 2) * (canvas.width / 6),
    y: (canvas.height / 2) + (Math.random() - 0.5) * 50,
    vx: 0, vy: 0, target: null, facing: 1, phase: Math.random() * Math.PI * 2, rotation: 0, state: 'swimming'
  };
};

const createInitialPets = (canvas: HTMLCanvasElement): PetState[] => {
    return [
        createPet(1, 1.0, 'Aqua', canvas, 'clownfish'),
        createPet(2, 0.8, 'Bubbles', canvas, 'clownfish'),
        createPet(3, 0.9, 'Finley', canvas, 'basslet')
    ];
};

const App: React.FC = () => {
    const [pets, setPets] = useState<PetState[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    const [hasAttemptedFullscreen, setHasAttemptedFullscreen] = useState(false);
    const [isInPlayMode, setIsInPlayMode] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isMutedRef = useRef(isMuted);
    isMutedRef.current = isMuted;

    const gameModelRef = useRef({
        pets: [] as PetState[],
        bubbles: [] as Bubble[],
        backgroundBubbles: [] as Bubble[],
        food: [] as Food[],
        poops: [] as Poop[],
        ripples: [] as Ripple[],
        decorations: [] as Decoration[],
        toy: null as {x: number, y: number} | null,
        cleaningAnimation: { active: false, startTime: 0, startCleanliness: [] as number[] },
        isInitialized: false,
        isNewGame: false,
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDraggingRef = useRef(false);
    const toyTimeoutRef = useRef<number | null>(null);
    const lastTap = useRef(0);
    const lastTickTimeRef = useRef(0);

    const sprite = useFishSprite();
    const audio = useAudio(isMuted);

    const calculateMood = useCallback((petState: PetState): Mood => {
        if (!petState.isAlive) return 'sos';
        const avg = (petState.hunger + petState.happiness + petState.health + petState.energy + petState.cleanliness) / 5;
        if (avg > 75) return 'happy';
        if (avg > 50) return 'ok';
        if (avg > 25) return 'sick';
        return 'sos';
    }, []);

    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, []);
    
    // Stage 1: Load data from storage (DOM-independent)
    useEffect(() => {
        let savedDataString: string | null = null;
        try {
            savedDataString = localStorage.getItem(SAVE_KEY);
        } catch (e) {
            console.error("Failed to read from localStorage. Starting a new game.", e);
        }

        const model = gameModelRef.current;

        if (!savedDataString) {
            console.log("No saved data found. Preparing new game.");
            model.isNewGame = true;
            setIsMuted(false);
        } else {
            try {
                const savedData = JSON.parse(savedDataString);
                const { lastSaveTime, pets: savedPets, food, poops, isMuted: savedMute } = savedData;

                if (!savedPets || !Array.isArray(savedPets) || savedPets.length === 0) {
                     throw new Error("Saved data is invalid or contains no pets.");
                }

                const now = Date.now();
                const elapsedHours = (now - lastSaveTime) / (1000 * 60 * 60);

                const poopCount = (poops || []).length;
                const updatedPets = savedPets.map((pet: PetState) => {
                    if (!pet.isAlive) return pet;

                    const HUNGER_DECAY_PER_HOUR = 15;
                    const HAPPINESS_DECAY_PER_HOUR = 10;
                    const ENERGY_DECAY_PER_HOUR = 12;
                    const ENERGY_REGEN_PER_HOUR = 25;
                    const CLEANLINESS_DECAY_PER_POOP_PER_HOUR = 30;
                    const HEALTH_DECAY_LOW_STATS_PER_HOUR = 10;
                    const HEALTH_REGEN_HIGH_STATS_PER_HOUR = 5;

                    if (pet.isSleeping || pet.activity === 'goingToSleep') {
                        pet.energy = Math.min(100, pet.energy + ENERGY_REGEN_PER_HOUR * elapsedHours);
                    } else {
                        pet.energy = Math.max(0, pet.energy - ENERGY_DECAY_PER_HOUR * elapsedHours);
                        pet.hunger = Math.max(0, pet.hunger - HUNGER_DECAY_PER_HOUR * elapsedHours);
                        pet.happiness = Math.max(0, pet.happiness - HAPPINESS_DECAY_PER_HOUR * elapsedHours);
                    }

                    pet.cleanliness = Math.max(0, pet.cleanliness - (poopCount * CLEANLINESS_DECAY_PER_POOP_PER_HOUR) * elapsedHours);

                    const avgStats = (pet.hunger + pet.happiness + pet.energy + pet.cleanliness) / 4;
                    if (avgStats < 20) {
                        pet.health = Math.max(0, pet.health - HEALTH_DECAY_LOW_STATS_PER_HOUR * elapsedHours);
                    } else if (avgStats > 80) {
                        pet.health = Math.min(100, pet.health + HEALTH_REGEN_HIGH_STATS_PER_HOUR * elapsedHours);
                    }
                    
                    if (pet.health <= 0) {
                        pet.isAlive = false;
                    }

                    pet.mood = calculateMood(pet);
                    if (pet.activity === 'goingToSleep') {
                        pet.activity = 'sleeping';
                        pet.isSleeping = true;
                    }
                    pet.target = null;
                    pet.vx = 0;
                    pet.vy = 0;
                    
                    return pet;
                });

                model.pets = updatedPets;
                model.food = food || [];
                model.poops = poops || [];
                setPets(updatedPets);
                setIsMuted(savedMute ?? false);

            } catch (error) {
                console.error("Failed to load or parse saved data. Starting a new game.", error);
                localStorage.removeItem(SAVE_KEY);
                model.isNewGame = true;
                setIsMuted(false);
            }
        }
        
        setIsLoading(false); // End loading, allows canvas to render
    }, [calculateMood]);
    
    useEffect(() => {
        const onFullScreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullScreenChange);
        document.addEventListener('webkitfullscreenchange', onFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullScreenChange);
        };
    }, []);
    
    useEffect(() => {
        const handleResize = () => {
            audio.playSwish();
            
            const model = gameModelRef.current;
            const sloshDirection = Math.random() > 0.5 ? 1 : -1;
            const sloshForce = 300;
            model.pets.forEach(p => {
                p.vx += sloshDirection * sloshForce * (Math.random() * 0.5 + 0.75);
                p.target = null;
            });
            model.food = model.food.map(f => ({ ...f, vx: f.vx + sloshDirection * (sloshForce / 4) }));
            model.bubbles = model.bubbles.map(b => ({ ...b, x: b.x + sloshDirection * -10 }));
            
            const canvas = canvasRef.current;
            if (canvas) {
                 model.ripples.push({
                    id: Date.now(),
                    x: canvas.width / 2,
                    y: canvas.height * (1-WATER_LEVEL),
                    radius: 1,
                    life: 1.5
                });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [audio]);
    
    const handlePlay = () => {
        const model = gameModelRef.current;
        const isAnyPetSleeping = model.pets.some(p => p.isAlive && (p.isSleeping || p.activity === 'goingToSleep'));
        if (!model.pets.some(p => p.isAlive) || isAnyPetSleeping) return;

        audio.playPlay();
        setIsInPlayMode(prev => {
            const isEntering = !prev;
            if (!isEntering) { // Exiting play mode
                model.toy = null;
                model.pets.forEach(p => p.target = null);
                isDraggingRef.current = false;
                if (toyTimeoutRef.current) { clearTimeout(toyTimeoutRef.current); toyTimeoutRef.current = null; }
            }
            return isEntering;
        });
    };

    const handleClean = () => {
        const model = gameModelRef.current;
        const mainPet = model.pets[0];
        const isAnyPetSleeping = model.pets.some(p => p.isAlive && (p.isSleeping || p.activity === 'goingToSleep'));
        if (!model.pets.some(p => p.isAlive) || isAnyPetSleeping || model.cleaningAnimation.active) return;
        if (model.poops.length === 0 && (mainPet && mainPet.cleanliness >= 99)) return;

        audio.playClean();
        model.cleaningAnimation = { 
            active: true, 
            startTime: performance.now(),
            startCleanliness: model.pets.map(p => p.cleanliness) 
        };
        setIsCleaning(true);
    };

    const handleLights = () => {
        const model = gameModelRef.current;
        if (!model.pets.some(p => p.isAlive)) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const sandY = canvas.height - SAND_HEIGHT;
        
        const isNightMode = model.pets.some(p => p.isAlive && (p.isSleeping || p.activity === 'goingToSleep'));

        model.pets.forEach(pet => {
            if (pet.isAlive) {
                if (isNightMode) { // Waking up
                    pet.isSleeping = false;
                    pet.activity = 'idle';
                    pet.target = null;
                } else if (pet.activity !== 'goingToSleep' && pet.activity !== 'sleeping') { // Going to sleep
                    pet.activity = 'goingToSleep';
                    
                    if (pet.id === 1) {
                        pet.target = { x: canvas.width / 2, y: sandY - 20 };
                    } else {
                        const randomX = 50 + Math.random() * (canvas.width - 100);
                        const randomY = sandY - 20 - (Math.random() * 20);
                        pet.target = { x: randomX, y: randomY };
                    }
                }
            }
        });

        setPets([...model.pets]);
    };

    const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleInteractionStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const model = gameModelRef.current;
        const isAnyPetSleeping = model.pets.some(p => p.isSleeping || p.activity === 'goingToSleep');
        if (model.pets.length === 0 || !model.pets.some(p => p.isAlive) || isAnyPetSleeping) return;

        const coords = getCoords(e);
        if (!coords) return;
        const { x, y } = coords;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const waterTopPx = canvas.height * (1 - WATER_LEVEL);

        if (isInPlayMode) {
            isDraggingRef.current = true;
            if (toyTimeoutRef.current) { clearTimeout(toyTimeoutRef.current); toyTimeoutRef.current = null; }
            model.toy = { x, y };
        } else {
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;
            const FOOD_COLORS = ['#c27b4f', '#a4653e', '#8b5a2b', '#D2691E'];

            const pokedPet = model.pets.find(p => p.isAlive && Math.hypot(x - p.x, y - p.y) < 50 * p.scale);
            
            if (pokedPet) {
                audio.playPoke();
                const fleeDx = pokedPet.x - x; const fleeDy = pokedPet.y - y; const fleeDist = Math.hypot(fleeDx, fleeDy) || 1;
                const impulse = 250;
                pokedPet.vx += (fleeDx / fleeDist) * impulse;
                pokedPet.vy += (fleeDy / fleeDist) * impulse;
                pokedPet.target = null;
                // A poke should not count as the first tap of a double-tap. Reset the timer.
                lastTap.current = 0;
            } else {
                // Not a poke, so check for double-tap-to-feed.
                if (now - lastTap.current < DOUBLE_TAP_DELAY) {
                    if (model.food.length > 9) return;
                    audio.playFeed();
                    const newFoods: Food[] = Array.from({ length: 3 }, (_, i) => ({
                        id: Date.now() + i, x: x + (Math.random() - 0.5) * 30, y: waterTopPx - 10,
                        vx: (Math.random() - 0.5) * 15, vy: (Math.random() * -5), state: 'falling', life: 15,
                        color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)]
                    }));
                    model.food.push(...newFoods);
                    // Reset tap timer after feeding to prevent a third tap from also feeding.
                    lastTap.current = 0;
                } else {
                    // It's a single tap on empty water. Register it for a potential double-tap.
                    lastTap.current = now;
                }
            }
        }
    };

    const handleInteractionMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isInPlayMode || !isDraggingRef.current) return;
        const coords = getCoords(e);
        if (coords) gameModelRef.current.toy = { x: coords.x, y: coords.y };
    };

    const handleInteractionEnd = () => {
        if (isInPlayMode && isDraggingRef.current) {
            isDraggingRef.current = false;
            toyTimeoutRef.current = window.setTimeout(() => { gameModelRef.current.toy = null }, 3000);
        }
    };

    // Stage 2: Animation loop and canvas-dependent initialization
    useEffect(() => {
        if (isLoading || !sprite.isReady) return;
        
        let animationId: number;
        let lastTime = 0;

        const animate = (time: number) => {
            animationId = requestAnimationFrame(animate);
            
            const model = gameModelRef.current;
            const canvas = canvasRef.current;

            if (!canvas) return; // Wait until canvas is rendered.

            // On every frame, check if the canvas size needs to be updated for responsiveness.
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }
            
            // Wait until the canvas has been laid out by the browser and has a non-zero size.
            if (canvas.width === 0 || canvas.height === 0) {
                return;
            }

            // --- ONE-TIME INITIALIZE (after canvas is ready and sized) ---
            if (!model.isInitialized) {
                if (model.isNewGame) {
                    const newPets = createInitialPets(canvas);
                    model.pets = newPets;
                    setPets(newPets);
                } else {
                    // For loaded games, just ensure pets are within bounds of the current canvas size
                    model.pets.forEach(pet => {
                        pet.x = Math.max(0, Math.min(canvas.width, pet.x));
                        pet.y = Math.max(0, Math.min(canvas.height, pet.y));
                    });
                    setPets([...model.pets]);
                }
                
                model.isInitialized = true;
                lastTickTimeRef.current = time;
                lastTime = time; // Set lastTime to prevent a large initial dt
            }
            
            // --- MAIN GAME LOOP ---
            
            // Robust Delta Time Calculation
            if (lastTime === 0) {
                lastTime = time;
                return;
            }
            let dt = (time - lastTime) / 1000;
            // Cap dt to prevent massive jumps on tab-out/in, but allow for small stutters.
            // If dt is 0 or negative, skip frame.
            if (dt <= 0) return;
            dt = Math.min(0.1, dt);
            lastTime = time;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const waterTopPx = canvas.height * (1-WATER_LEVEL);
            const sandY = canvas.height - SAND_HEIGHT;

            // --- UPDATE LOGIC ---
            if (model.cleaningAnimation.active) {
                const elapsed = time - model.cleaningAnimation.startTime;
                const cleaningProgress = Math.min(elapsed / 2500, 1);
                
                model.pets.forEach((p, i) => {
                    const startVal = model.cleaningAnimation.startCleanliness[i] ?? p.cleanliness;
                    p.cleanliness = startVal + (100 - startVal) * cleaningProgress;
                });

                if (cleaningProgress >= 1) {
                    model.cleaningAnimation.active = false;
                    model.poops = [];
                    model.pets.forEach(p => p.cleanliness = 100);
                    setIsCleaning(false);
                    setPets([...model.pets]);
                    lastTickTimeRef.current = time;
                }
            }
            
            const activePetsForPlay = isInPlayMode && model.toy ? model.pets.filter(p => p.isAlive && !p.isSleeping) : [];
            const numActivePets = activePetsForPlay.length;

            model.pets.forEach(livePet => {
              const desiredWidth = Math.min(120, Math.max(80, canvas.width * 0.3));
              const visualScale = (desiredWidth / sprite.fw);
              const petHalfWidth = (sprite.fw * visualScale * livePet.scale) / 2;

              if (livePet.isAlive) {
                livePet.sleepProgress = livePet.sleepProgress ?? 0;
                if (livePet.activity === 'goingToSleep' || livePet.isSleeping) {
                    livePet.sleepProgress = Math.min(1, livePet.sleepProgress + dt * 0.5);
                } else {
                    livePet.sleepProgress = Math.max(0, livePet.sleepProgress - dt * 1);
                }

                if (livePet.isSleeping) {
                    // If sleeping, do nothing more for movement in this frame.
                } else {
                    // --- Handle all movement for non-sleeping pets ---

                    // 1. Determine velocity based on activity
                    if (livePet.activity === 'goingToSleep') {
                        if (!livePet.target || livePet.target.isFood || livePet.target.isToy) {
                           livePet.target = { x: Math.random() * canvas.width, y: sandY - 20 };
                        }
                        const dx = livePet.target.x - livePet.x;
                        const dy = livePet.target.y - livePet.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist < 10) {
                            livePet.activity = 'sleeping';
                            livePet.isSleeping = true;
                            livePet.vx = 0;
                            livePet.vy = 0;
                        } else {
                            const speed = 40;
                            const desiredVx = (dx / dist) * speed, desiredVy = (dy / dist) * speed;
                            livePet.vx += (desiredVx - livePet.vx) * 0.05;
                            livePet.vy += (desiredVy - livePet.vy) * 0.05;
                        }
                    } else { // Handle 'idle', 'playing', etc.
                        const EAT_COOLDOWN = 500;
                        const justAte = time - livePet.lastAteAt <= EAT_COOLDOWN;

                        if (!justAte) {
                            if (isInPlayMode && model.toy) {
                                const activeIndex = activePetsForPlay.findIndex(p => p.id === livePet.id);
                                if (activeIndex !== -1) {
                                    // Distribute pets in a 180-degree semi-circle below the toy
                                    const angle = (Math.PI * activeIndex) / Math.max(1, numActivePets - 1);
                                    
                                    // Add some variation to radius based on pet ID so they aren't in a perfect line
                                    const baseRadius = 60;
                                    const radiusVariation = (livePet.id % 3 - 1) * 15; // -15, 0, or 15
                                    const effectiveRadius = baseRadius + radiusVariation;

                                    // This creates a semi-circle arc below the toy
                                    const targetX = model.toy.x - effectiveRadius * Math.cos(angle);
                                    const targetY = model.toy.y + effectiveRadius * Math.sin(angle);

                                    livePet.target = { 
                                        x: targetX,
                                        y: Math.max(waterTopPx + 20, targetY), 
                                        isToy: true 
                                    };
                                }
                            } else {
                                if (livePet.target?.isToy) livePet.target = null;

                                if (livePet.target && !livePet.target.isFood && !livePet.target.isToy) {
                                    if (Math.hypot(livePet.target.x - livePet.x, livePet.target.y - livePet.y) < 50 * livePet.scale) {
                                        livePet.target = null;
                                    }
                                }
                                
                                let closestFood: Food | null = null;
                                if (livePet.hunger < 95) {
                                    let minFoodDist = Infinity;
                                    for (const f of model.food) {
                                        if (f.y > waterTopPx) {
                                            const dist = Math.hypot(f.x - livePet.x, f.y - livePet.y);
                                            if (dist < minFoodDist) { minFoodDist = dist; closestFood = f; }
                                        }
                                    }
                                }
                                
                                if (closestFood) {
                                    const targetOffsetX = (livePet.id - 1.5) * 25 * livePet.scale;
                                    livePet.target = { x: closestFood.x + targetOffsetX, y: closestFood.y, isFood: true };
                                } else {
                                    if (livePet.target?.isFood) livePet.target = null;

                                    if (livePet.activity === 'idle' && !livePet.target) {
                                         if (Math.random() < 0.005) {
                                             const otherPet = model.pets.find(p => p.id !== livePet.id && p.isAlive);
                                             if (otherPet) {
                                                 const offsetX = (otherPet.facing > 0 ? -1 : 1) * (60 * otherPet.scale);
                                                 const offsetY = (Math.random() - 0.5) * 30;
                                                 livePet.target = { x: otherPet.x + offsetX, y: otherPet.y + offsetY, isFriend: true };
                                             }
                                         } else {
                                            const swimHeight = sandY - waterTopPx - 30;
                                            const biasedRandom = Math.pow(Math.random(), 0.6); 
                                            const targetY = (waterTopPx + 20) + biasedRandom * swimHeight;
                                            const randomX = 10 + Math.random() * (canvas.width - 20);
                                            livePet.target = { x: randomX, y: targetY };
                                        }
                                    }
                                }
                            }
                        }

                        if (livePet.target) {
                            const dx = livePet.target.x - livePet.x, dy = livePet.target.y - livePet.y;
                            const dist = Math.hypot(dx, dy) || 1;
                            const isChasing = livePet.target.isFood || livePet.target.isToy;
                            const isFollowing = livePet.target.isFriend;
                            const speedMap = { happy: 180, ok: 150, sick: 90, sos: 60 };
                            const idleSpeedMap = { happy: 70, ok: 50, sick: 30, sos: 15 };
                            const followSpeedMap = { happy: 90, ok: 70, sick: 45, sos: 25 };
                            
                            const speedTier = isChasing ? speedMap : (isFollowing ? followSpeedMap : idleSpeedMap);
                            let targetSpeed = speedTier[livePet.mood];
                            const acceleration = isChasing ? 0.1 : 0.05;
                            
                            const slowingRadius = isChasing ? 120 : 80;
                            if (dist < slowingRadius) {
                                const minSpeedFactor = isChasing ? 0.4 : 0.2;
                                const speedFactor = minSpeedFactor + (1 - minSpeedFactor) * (dist / slowingRadius);
                                targetSpeed *= speedFactor;
                            }

                            const desiredVx = (dx / dist) * targetSpeed, desiredVy = (dy / dist) * targetSpeed;
                            livePet.vx += (desiredVx - livePet.vx) * acceleration; livePet.vy += (desiredVy - livePet.vy) * acceleration;
                            if (Math.abs(livePet.vx) > 0.1) livePet.facing += (Math.sign(livePet.vx) - livePet.facing) * (isChasing ? 0.15 : 0.08);
                        }
                    }

                    // 2. Apply friction and update position (common for all non-sleeping pets)
                    let friction = 0.95;
                    if (livePet.target && (livePet.target.isFood || livePet.target.isToy)) {
                        const distToTarget = Math.hypot(livePet.target.x - livePet.x, livePet.target.y - livePet.y);
                        if (distToTarget < 40 * livePet.scale) {
                            friction = 0.85;
                        }
                    }
                    livePet.vx *= friction; 
                    livePet.vy *= friction;

                    livePet.x += livePet.vx * dt;
                    livePet.y += livePet.vy * dt;
                    
                    livePet.x = Math.max(petHalfWidth, Math.min(canvas.width - petHalfWidth, livePet.x));
                    livePet.y = Math.max(waterTopPx + 20, Math.min(sandY - 10, livePet.y));
                    
                    livePet.phase += 0.02;
                    const speedVal = Math.hypot(livePet.vx, livePet.vy);
                    let targetRotation = speedVal > 5 ? (Math.max(-100, Math.min(100, livePet.vy)) / 100) * (Math.PI / 12) : 0;
                    if (livePet.facing < 0 && Math.abs(livePet.facing) > 0.33) targetRotation *= -1;
                    livePet.rotation += (targetRotation - livePet.rotation) * 0.1;
                }
                
                // Interactions
                if (isInPlayMode && model.toy && Math.hypot(model.toy.x - livePet.x, model.toy.y - livePet.y) < (65 * livePet.scale)) {
                    if (!livePet.lastToyInteraction || time - livePet.lastToyInteraction > 1000) {
                        audio.playToySqueak();
                        livePet.happiness = Math.min(100, livePet.happiness + 5);
                        livePet.lastToyInteraction = time;
                    }
                }
                
                const eatenFoodIds = new Set<number>();
                for (const f of model.food) if (Math.hypot(f.x - livePet.x, f.y - livePet.y) < (25 * livePet.scale)) eatenFoodIds.add(f.id);
                if (eatenFoodIds.size > 0) {
                  audio.playEat();
                  model.food = model.food.filter(f => !eatenFoodIds.has(f.id));
                  livePet.hunger = Math.min(100, livePet.hunger + 25 * eatenFoodIds.size);
                  livePet.target = null;
                  livePet.lastAteAt = time;
                }
              }
            });

            // Particles
            let newRipples: Ripple[] = [], didFoodPlop = false;
            model.food = model.food.map(f => {
                if (f.y < waterTopPx && f.state === 'falling') f.vy += 200 * dt;
                else {
                    if (f.state === 'falling') { f.state = 'sinking'; f.vy *= 0.3; newRipples.push({id: Date.now()+Math.random(),x:f.x,y:waterTopPx,radius:1,life:1}); didFoodPlop=true; }
                    f.vy += 25 * dt; f.vy *= 0.98;
                }
                f.y += f.vy * dt; f.x += f.vx * dt;
                const bottomY = sandY - 5;
                if (f.y>bottomY && f.vy>0) { f.y=bottomY; f.vy*=-0.4; f.vx*=0.7; if(Math.abs(f.vy)<1)f.vy=0; }
                if((f.x<5&&f.vx<0)||(f.x>canvas.width-5&&f.vx>0)) { f.vx*=-0.5; f.x=Math.max(5,Math.min(f.x,canvas.width-5)); }
                if (f.y>=bottomY&&Math.abs(f.vy)<1) f.life-=0.5*dt;
                return f;
            }).filter(f => f.life > 0);
            
            const processBubbles = (b: Bubble) => {
                 if (b.y - b.r < waterTopPx) {
                     newRipples.push({id:Date.now()+Math.random(),x:b.x,y:waterTopPx,radius:1,life:0.5});
                     return false;
                 }
                 return true;
            };
            model.bubbles = model.bubbles.map(b=>({...b, y:b.y-b.vy*dt})).filter(processBubbles);
            model.backgroundBubbles = model.backgroundBubbles.map(b=>({...b, y:b.y-b.vy*dt, x:b.x+Math.sin(b.y/30)*0.5})).filter(processBubbles);
            model.ripples = [...model.ripples.map(r=>({...r,radius:r.radius+30*dt,life:r.life-0.8*dt})).filter(r=>r.life>0), ...newRipples];
            
            model.pets.forEach(livePet => {
                if (livePet.isAlive && !livePet.isSleeping) {
                    const bubbleParams = {happy:{speed:45,count:10},ok:{speed:35,count:6},sick:{speed:20,count:4},sos:{speed:10,count:2}}[livePet.mood];
                    if(model.bubbles.length < bubbleParams.count && time - livePet.lastBubbleAt > 800) { 
                        model.bubbles.push({x:livePet.x,y:livePet.y,r:(1+Math.random()*2.5)*livePet.scale,vy:(bubbleParams.speed+Math.random()*10)*livePet.scale,a:0.8}); 
                        livePet.lastBubbleAt = time + Math.random() * 200;
                    }
                }
            });
            if(Math.random()>0.1&&model.backgroundBubbles.length<120) model.backgroundBubbles.push({x:Math.random()*canvas.width,y:sandY,r:0.5+Math.random()*2,vy:20+Math.random()*40,a:0.1+Math.random()*0.4});
            
            if (didFoodPlop) audio.playPlop();
        
            // Slow tick for stat decay & UI sync
            if (time - lastTickTimeRef.current > 5000) {
                lastTickTimeRef.current = time;
                model.pets.forEach(livePet => {
                    if (!livePet.isAlive) return;
                    if (!livePet.isSleeping) {
                        livePet.hunger = Math.max(0, livePet.hunger - 1.5);
                        livePet.happiness = Math.max(0, livePet.happiness - 1);
                        livePet.energy = Math.max(0, livePet.energy - 0.8);
                        if (model.poops.length > 0) {
                            livePet.cleanliness = Math.max(0, livePet.cleanliness - (model.poops.length * 2.5));
                        }
                    } else if (livePet.isSleeping) {
                        livePet.energy = Math.min(100, livePet.energy + 2);
                    }
                    const avgStats = (livePet.hunger+livePet.happiness+livePet.energy+livePet.cleanliness)/4;
                    if(avgStats < 20) livePet.health = Math.max(0, livePet.health - 1);
                    else if (avgStats > 80) livePet.health = Math.min(100, livePet.health + 0.5);
                    livePet.mood = calculateMood(livePet);
                    if(livePet.health <= 0) livePet.isAlive = false;
                });
                
                for (let i = 0; i < model.pets.length; i++) {
                    for (let j = i + 1; j < model.pets.length; j++) {
                        const petA = model.pets[i];
                        const petB = model.pets[j];
                        if (petA.isAlive && petB.isAlive) {
                            const dist = Math.hypot(petA.x - petB.x, petA.y - petB.y);
                            const interactionDistance = (40 * petA.scale) + (40 * petB.scale) + 20; 
                            if (dist < interactionDistance) {
                                petA.happiness = Math.min(100, petA.happiness + 0.5);
                                petB.happiness = Math.min(100, petB.happiness + 0.5);
                            }
                        }
                    }
                }

                if (Math.random() < 0.05 && model.poops.length < 3 && model.pets.some(p => p.hunger > 50)) {
                    model.poops.push({ id: Date.now(), x: 10 + Math.random() * (canvas.width - 20), y: sandY - 5 });
                }
                
                setPets([...model.pets]);

                const gameStateToSave = {
                    lastSaveTime: Date.now(),
                    pets: model.pets,
                    food: model.food,
                    poops: model.poops,
                    isMuted: isMutedRef.current,
                };
                try {
                    localStorage.setItem(SAVE_KEY, JSON.stringify(gameStateToSave));
                } catch (e) {
                    console.error("Failed to save game state:", e);
                }
            }

            // --- RENDER ---
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawLightStreaks(ctx, time, waterTopPx);
            
            drawBubbles(ctx, [...model.backgroundBubbles]);
            drawFood(ctx, model.food);
            drawPoops(ctx, model.poops);

            const sortedPets = [...model.pets].sort((a, b) => a.y - b.y);

            sortedPets.forEach(pet => {
                drawPet(ctx, pet, sprite, canvas);
            });
            
            if (model.cleaningAnimation.active) {
                drawCleaningHand(ctx, (time-model.cleaningAnimation.startTime)/2500);
            }

            drawBubbles(ctx, model.bubbles);
            drawRipples(ctx, model.ripples);
            
            const mainPet = model.pets[0];
            const dirtiness = 1-((mainPet?.cleanliness ?? 100)/100);
            if(dirtiness > 0.01) {
                ctx.fillStyle=`rgba(85,107,47,${dirtiness*0.4})`; ctx.fillRect(0,waterTopPx,canvas.width,sandY-waterTopPx);
                ctx.fillStyle=`rgba(54,88,33,${dirtiness*0.6})`;
                
                const numSplotches = Math.floor(dirtiness * 20);
                for(let i=0; i < numSplotches; i++){
                    const seed = i * 1337;
                    const seededRandom = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
                    const splotchX = seededRandom(seed * 1.23) * canvas.width;
                    const splotchY = waterTopPx + seededRandom(seed * 4.56) * (sandY - waterTopPx);
                    const baseSize = 15 + seededRandom(seed * 7.89) * 35;
                    const points = 5 + Math.floor(seededRandom(seed) * 5);
                    const angleStep = (Math.PI * 2) / points;
                    const pathPoints = [];
                    for (let j = 0; j < points; j++) {
                        const angle = j * angleStep;
                        const randomAngleOffset = (seededRandom(seed*j*9.87)-0.5)*angleStep*0.7;
                        const randomRadius = baseSize * (0.75 + seededRandom(seed*j*5.43)*0.5);
                        pathPoints.push({ x: splotchX+Math.cos(angle+randomAngleOffset)*randomRadius, y: splotchY+Math.sin(angle+randomAngleOffset)*randomRadius });
                    }
                    ctx.beginPath();
                    if (pathPoints.length > 2) {
                        ctx.moveTo((pathPoints[0].x + pathPoints[pathPoints.length - 1].x) / 2, (pathPoints[0].y + pathPoints[pathPoints.length - 1].y) / 2);
                        for (let j = 0; j < pathPoints.length; j++) {
                            const p1 = pathPoints[j], p2 = pathPoints[(j + 1) % pathPoints.length];
                            ctx.quadraticCurveTo(p1.x, p1.y, (p1.x+p2.x)/2, (p1.y+p2.y)/2);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                }
            }

            if (model.toy) drawToy(ctx, model.toy);
            
            const anyPetSleeping = model.pets.some(p => p.isAlive && p.isSleeping);
            const anyPetGoingToSleep = model.pets.some(p => p.isAlive && p.activity === 'goingToSleep');
            const sleepProgress = model.pets.reduce((max, p) => Math.max(max, p.sleepProgress ?? 0), 0);


            if (sleepProgress > 0) {
                ctx.fillStyle=`rgba(0,0,0,${0.7 * sleepProgress})`; ctx.fillRect(0,0,canvas.width,canvas.height);
                if (anyPetSleeping || anyPetGoingToSleep) {
                    model.pets.forEach(p => {
                        if (p.isAlive && p.isSleeping) {
                            const zzz_x = p.x;
                            const zzz_y = p.y - 20;
                            ctx.fillStyle=`rgba(255,255,255, ${p.sleepProgress})`; ctx.font='24px VT323'; ctx.textAlign='center';
                            ctx.fillText('Z Z Z', zzz_x, zzz_y);
                        }
                    });
                }
            }
            if (mainPet && !mainPet.isAlive) {
                ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            }
        };
        
        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [isLoading, sprite.isReady, audio, calculateMood, isInPlayMode]);

    const mainPet = pets[0];
    const isNightMode = pets.some(p => p.isAlive && (p.isSleeping || p.activity === 'goingToSleep'));
    
    const handleFirstInteraction = useCallback(() => {
        audio.unlockAudio();
        if (!document.fullscreenElement && !hasAttemptedFullscreen) {
            toggleFullScreen();
            setHasAttemptedFullscreen(true);
        }
    }, [audio, hasAttemptedFullscreen, toggleFullScreen]);

    if (isLoading) {
        return (
            <div id="app-container" className="h-screen flex justify-center items-center p-2 bg-[#040913]">
                <div className="text-center">
                    <h1 className="text-4xl text-white mb-4">Pet.io</h1>
                    <p className="text-xl text-yellow-400 animate-pulse">Waking up your pets...</p>
                </div>
            </div>
        );
    }

    return (
        <div id="app-container" className="h-screen flex justify-center p-2" onPointerDown={handleFirstInteraction}>
            <main className="w-full ui-container">
                <Header 
                    className="header" 
                    isMuted={isMuted} 
                    onToggleMute={() => setIsMuted(m => !m)}
                />
                <div className="ui-panel relative p-0 overflow-hidden flex-1 min-h-0 touch-none canvas-container">
                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-full" 
                      onPointerDown={handleInteractionStart}
                      onPointerMove={handleInteractionMove}
                      onPointerUp={handleInteractionEnd}
                      onPointerLeave={handleInteractionEnd}
                    />
                </div>
                <div className="ui-controls">
                    <div className="ui-panel text-center text-xl text-yellow-400 tracking-wider">
                         {`MOOD: ${mainPet?.isAlive ? (mainPet?.mood.toUpperCase() ?? '') : "X_X"}`}
                    </div>
                    {mainPet?.isAlive && (
                        <div className="ui-panel grid grid-cols-2 gap-x-4 gap-y-2">
                            <StatusBar label="Hunger" value={mainPet.hunger} icon={<i className="fas fa-drumstick-bite"></i>} />
                            <StatusBar label="Happy" value={mainPet.happiness} icon={<i className="fas fa-smile"></i>} />
                            <StatusBar label="Energy" value={mainPet.energy} icon={<i className="fas fa-bolt"></i>} />
                            <StatusBar label="Clean" value={mainPet.cleanliness} icon={<i className="fas fa-shower"></i>} />
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={handlePlay} className="ui-button flex flex-col items-center justify-center gap-1">
                            <i className="fas fa-gamepad text-2xl"></i><span>{isInPlayMode ? 'STOP' : 'PLAY'}</span>
                        </button>
                        <button 
                            onClick={handleClean} 
                            disabled={isCleaning}
                            className="ui-button flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i className="fas fa-soap text-2xl"></i><span>CLEAN</span>
                        </button>
                        <button onClick={handleLights} className="ui-button flex flex-col items-center justify-center gap-1">
                            <i className={`fas ${isNightMode ? 'fa-sun' : 'fa-lightbulb'} text-2xl`}></i>
                            <span>{isNightMode ? 'WAKE' : 'SLEEP'}</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
