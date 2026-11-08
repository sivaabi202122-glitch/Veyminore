/**
 * AROWGO — AudioManager
 *
 * Procedural Web Audio API sound synthesizer and haptic manager.
 * 100% offline, zero audio asset downloads, ultra-low latency.
 */
import { SaveManager } from './SaveManager';

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private constructor() {
    // AudioContext will be initialized on first user interaction
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private isSoundEnabled(): boolean {
    const settings = SaveManager.getInstance().getSettings();
    return settings.soundEnabled && !this.isMuted;
  }

  private isHapticsEnabled(): boolean {
    const settings = SaveManager.getInstance().getSettings();
    return settings.hapticsEnabled;
  }

  /**
   * Subtle haptic feedback vibration.
   */
  vibrate(pattern: number | number[]): void {
    if (!this.isHapticsEnabled()) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently ignore if not supported
      }
    }
  }

  /**
   * Sound played when an arrow starts moving / is selected.
   */
  playTap(): void {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);

    this.vibrate(10);
  }

  /**
   * Sound played when an arrow successfully clears the board (smooth ascending slide).
   */
  playExit(): void {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);

    this.vibrate(20);
  }

  /**
   * Sound played when an arrow is blocked (soft thud / low buzz).
   */
  playBlocked(): void {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);

    this.vibrate([25, 30, 25]);
  }

  /**
   * Sound played for a hint or undo action.
   */
  playHint(): void {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
    osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);

    this.vibrate(15);
  }

  /**
   * Sound played when a level is completed (cheerful pentatonic arpeggio).
   */
  playWin(): void {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + index * 0.09);

      gain.gain.setValueAtTime(0.2, startTime + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + index * 0.09);
      osc.stop(startTime + index * 0.09 + 0.35);
    });

    this.vibrate([40, 60, 80]);
  }
}
