export const playSuccessChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Sweet, magical chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1); // C#6
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.2); // E6
    
    // Envelope for a soft attack and bell-like decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};

export const playProcessingSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Techy scanning/processing sound
    osc.type = 'triangle';
    
    // Rapid frequency modulation
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};

export const vibrateClick = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(15); // Short, sharp click
  }
};

export const vibrateEngineSpool = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    // Escalate vibration pulses (warp engine spinning up)
    navigator.vibrate([30, 100, 40, 90, 50, 80, 70, 60, 100, 50, 200]);
  }
};

export const vibrateSuccess = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    // Classic victory haptic feedback
    navigator.vibrate([100, 50, 100, 50, 300]);
  }
};
