let audioCtx: AudioContext | null = null;
let isMuted = false;
let isEffectsEnabled = true;
let isVoiceEnabled = true;
let globalVolume = 0.6;

// Initialize audio settings from localStorage if available
if (typeof window !== 'undefined') {
  const storedMute = localStorage.getItem('memory_game_muted');
  isMuted = storedMute === 'true';

  const storedEffects = localStorage.getItem('memory_game_effects');
  if (storedEffects !== null) {
    isEffectsEnabled = storedEffects === 'true';
  }

  const storedVoice = localStorage.getItem('memory_game_voice');
  if (storedVoice !== null) {
    isVoiceEnabled = storedVoice === 'true';
  }

  const storedVol = localStorage.getItem('memory_game_volume');
  if (storedVol !== null) {
    globalVolume = parseFloat(storedVol);
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const getMuteState = (): boolean => isMuted;
export const setMuteState = (muted: boolean): void => {
  isMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('memory_game_muted', String(muted));
  }
};

export const getEffectsEnabled = (): boolean => isEffectsEnabled;
export const setEffectsEnabled = (enabled: boolean): void => {
  isEffectsEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('memory_game_effects', String(enabled));
  }
};

export const getVoiceEnabled = (): boolean => isVoiceEnabled;
export const setVoiceEnabled = (enabled: boolean): void => {
  isVoiceEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('memory_game_voice', String(enabled));
  }
};

export const getGlobalVolume = (): number => globalVolume;
export const setGlobalVolume = (vol: number): void => {
  globalVolume = vol;
  if (typeof window !== 'undefined') {
    localStorage.setItem('memory_game_volume', String(vol));
  }
};

/**
 * Procedural Sound: Card Flip
 * Soft futuristic high-tech click
 */
export const playFlipSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

  gainNode.gain.setValueAtTime(0.08 * globalVolume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
};

/**
 * Procedural Sound: Button Hover Click
 * Soft UI click
 */
export const playHoverSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);

  gainNode.gain.setValueAtTime(0.02 * globalVolume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
};

/**
 * Procedural Sound: Correct Match
 * Sparkle sound / Magic chime
 */
export const playMatchSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chimeNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6 (Sparkling Major Pentatonic)

  chimeNotes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.05;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(400, noteTime);

    gainNode.gain.setValueAtTime(0.08 * globalVolume, noteTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.35);
  });
};

/**
 * Procedural Sound: Wrong Match
 * Cute cartoon boing / funny fail sound
 */
export const playWrongSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Sound 1: Cute descending cartoon "Boing"
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = 'triangle';
  // Rapid pitch bend up and then descending wobble
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.28);

  gainNode.gain.setValueAtTime(0.18 * globalVolume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);

  // Sound 2: Funny quick dissonant secondary beep
  const osc2 = ctx.createOscillator();
  const gainNode2 = ctx.createGain();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(135, now + 0.05);
  osc2.frequency.linearRampToValueAtTime(80, now + 0.25);

  gainNode2.gain.setValueAtTime(0.04 * globalVolume, now + 0.05);
  gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc2.connect(gainNode2);
  gainNode2.connect(ctx.destination);

  osc2.start(now + 0.05);
  osc2.stop(now + 0.25);
};

/**
 * Procedural Sound: Combo / Multiplier
 * Coin collection sound / Level-up sound
 */
export const playComboSound = (streak: number) => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const multiplier = Math.min(streak, 6);

  // Classic retro coin chime (double ring C5 -> G5 or similar, pitched up based on streak)
  const baseFreq = 523.25 * (1 + (multiplier - 2) * 0.12); // C5 scaled up
  const highFreq = baseFreq * 1.5; // G5 scale

  const playCoinTone = (freq: number, start: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    
    gainNode.gain.setValueAtTime(0.12 * globalVolume, start);
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(start);
    osc.stop(start + 0.25);
  };

  playCoinTone(baseFreq, now);
  playCoinTone(highFreq, now + 0.07);
};

/**
 * Procedural Sound: New Record (Trophy Sound)
 * Special golden trophy sparkling fan-fare
 */
export const playTrophySound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const notes = [587.33, 659.25, 783.99, 880.00, 1174.66, 1318.51, 1567.98]; // D5, E5, G5, A5, D6, E6, G6
  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.04;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gainNode.gain.setValueAtTime(0.12 * globalVolume, noteTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.45);
  });
};

/**
 * Procedural Sound: Victory Sound
 * Epic achievement sound / Trophy celebration fan-fare
 */
export const playVictorySound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Grand major ascending scale ending in a brilliant high note
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51]; // C4, E4, G4, C5, E5, G5, C6, E6
  const tempo = 0.08;

  notes.forEach((freq, idx) => {
    const isLast = idx === notes.length - 1;
    const noteTime = now + idx * tempo;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = isLast ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, noteTime);

    // Warm vibrato on the final chord tones
    if (isLast) {
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.value = 6; // 6Hz
      vibratoGain.gain.value = 8;  // modulate pitch by 8Hz
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(noteTime);
      vibrato.stop(noteTime + 1.2);
    }

    gainNode.gain.setValueAtTime(0.12 * globalVolume, noteTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + (isLast ? 1.0 : 0.4));

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + (isLast ? 1.2 : 0.45));
  });
};

/**
 * Procedural Sound: Boing (Cartoon upward & downward glide)
 */
export const playBoingSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(380, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

  gainNode.gain.setValueAtTime(0.16 * globalVolume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.36);
};

/**
 * Procedural Sound: Oops (Cute comical double beep)
 */
export const playOopsSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // First high beep, then low beep
  const playTone = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    
    gainNode.gain.setValueAtTime(0.1 * globalVolume, start);
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  };

  playTone(400, now, 0.08);
  playTone(280, now + 0.1, 0.14);
};

/**
 * Procedural Sound: Funny Fail Sound (Sad trombone-like drop)
 */
export const playFailSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(110, now + 0.4);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

  gainNode.gain.setValueAtTime(0.12 * globalVolume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.45);
};

/**
 * Procedural Sound: Sparkle (High twinkling bells)
 */
export const playSparkleSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [987.77, 1174.66, 1318.51, 1567.98, 1975.53]; // B5, D6, E6, G6, B6 (brilliant major pentatonic)

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.04;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gainNode.gain.setValueAtTime(0.06 * globalVolume, noteTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.25);
  });
};

/**
 * Procedural Sound: Magic Chime
 */
export const playChimeSound = () => {
  playMatchSound(); // existing beautiful chime
};

/**
 * Procedural Sound: Success Bell
 */
export const playBellSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Primary Bell
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator(); // subharmonic
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, now); // A5

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1760, now); // A6 (high ring)

  gain1.gain.setValueAtTime(0.1 * globalVolume, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  gain2.gain.setValueAtTime(0.05 * globalVolume, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.65);
  osc2.start(now);
  osc2.stop(now + 0.45);
};

/**
 * Procedural Sound: Trophy Celebration
 */
export const playTrophyCelebrationSound = () => {
  playVictorySound();
};

/**
 * Procedural Sound: Fireworks (comprising crackling sparks and pop bursts)
 */
export const playFireworksSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Let's create 3 separate firework pops spread over 1 second
  for (let i = 0; i < 3; i++) {
    const popDelay = i * 0.35;
    const popTime = now + popDelay;

    // Pop core
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200 + Math.random() * 100, popTime);
    osc.frequency.exponentialRampToValueAtTime(50, popTime + 0.15);

    gainNode.gain.setValueAtTime(0.15 * globalVolume, popTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, popTime + 0.18);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(popTime);
    osc.stop(popTime + 0.2);

    // Crackle spark tails (noise bursts)
    if (ctx.createBuffer) {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800 + Math.random() * 800;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06 * globalVolume, popTime + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.28);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(popTime + 0.05);
      noise.stop(popTime + 0.3);
    }
  }
};

/**
 * Procedural Sound: Crowd Cheer (sweeping band-passed white noise)
 */
export const playCrowdCheerSound = () => {
  if (isMuted || !isEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (!ctx.createBuffer) return;

  const duration = 1.8;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter to make it sound like a warm roar/cheer rather than static
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(450, now);
  filter.frequency.exponentialRampToValueAtTime(750, now + 0.4);
  filter.frequency.exponentialRampToValueAtTime(350, now + duration);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.12 * globalVolume, now + 0.3);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration + 0.1);
};

/**
 * Voice Speech Utility (Cancels current speaking queue)
 */
export const cancelSpeech = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Cartoon Voice Assistant Speech Engine
 * Configured with higher pitch & rate to mimic Pixar/Disney friendly robot/spark character!
 */
export const speakVoice = (text: string, onStart?: () => void, onEnd?: () => void) => {
  if (typeof window === 'undefined') return;
  if (isMuted || !isVoiceEnabled) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  // Let SpeechSynthesis handle queuing automatically.
  // Strip emojis from reading out loud to make speech pristine and cute!
  const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.volume = globalVolume;
  
  // Modulate rate & pitch to give an energetic, friendly Pixar / Disney style cartoon feel!
  utterance.rate = 1.25;  // Accelerated cute rate
  utterance.pitch = 1.6;  // Adorable high-pitched Disney voice companion!

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;

  const voices = synth.getVoices();
  
  // Find standard natural female or high-pitched English voices
  let selectedVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Hazel') || v.name.includes('Zira'))
  );
  
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
  }
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith('en'));
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  synth.speak(utterance);
};
