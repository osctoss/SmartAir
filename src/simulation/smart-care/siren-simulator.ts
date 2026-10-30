export interface SirenActivationResult {
  canSound: boolean;
  sirenState: 'sounding' | 'silenced' | 'unavailable';
  failureReason?: string;
  summary: string;
}

export function evaluateSirenActivation(
  gatewayProcessedSuccessfully: boolean,
  sirenOutputAvailable: boolean,
  sirenOutputEnabled: boolean,
): SirenActivationResult {
  if (!sirenOutputEnabled) {
    return {
      canSound: false,
      sirenState: 'silenced',
      summary: 'Building siren output is disabled by property policy.',
    };
  }

  if (!gatewayProcessedSuccessfully) {
    return {
      canSound: false,
      sirenState: 'unavailable',
      failureReason: 'gateway-unreached',
      summary: 'Siren actuation skipped: gateway did not receive or process the incident packet.',
    };
  }

  if (!sirenOutputAvailable) {
    return {
      canSound: false,
      sirenState: 'unavailable',
      failureReason: 'siren-faulted',
      summary: 'Siren actuation failed: physical horn / siren output unit is OFFLINE or faulted.',
    };
  }

  return {
    canSound: true,
    sirenState: 'sounding',
    summary: 'Shared building siren successfully triggered by gateway.',
  };
}

/**
 * Synthetic audio siren player using Web Audio API.
 * Oscillates carrier frequency with a Low-Frequency Oscillator (LFO)
 * for a realistic building emergency wail (650 Hz - 910 Hz).
 * Strictly user-controlled with safe volume and explicit stop.
 */
class SyntheticSirenPlayer {
  private audioCtx: AudioContext | null = null;
  private liveOsc: OscillatorNode | null = null;
  private liveLfo: OscillatorNode | null = null;
  private liveLfoGain: GainNode | null = null;
  private liveGain: GainNode | null = null;
  private testTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private testNodes: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null;
  private _isPlayingLive = false;
  private _isMuted = false;

  private getOrCreateContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return null;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public isPlaying(): boolean {
    return this._isPlayingLive || this.testNodes !== null;
  }

  public isMuted(): boolean {
    return this._isMuted;
  }

  public setMuted(muted: boolean): void {
    this._isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  /**
   * Starts the continuous building emergency siren during live simulation.
   */
  public startSiren(volume = 0.22): void {
    if (typeof window === 'undefined' || this._isMuted || this._isPlayingLive) return;

    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => this.initLiveSiren(ctx, volume)).catch(() => {});
    } else {
      this.initLiveSiren(ctx, volume);
    }
  }

  private initLiveSiren(ctx: AudioContext, volume: number): void {
    this.stopLiveSiren();

    const now = ctx.currentTime;

    // Main carrier tone (750 Hz center)
    this.liveOsc = ctx.createOscillator();
    this.liveOsc.type = 'sawtooth';
    this.liveOsc.frequency.setValueAtTime(750, now);

    // LFO: 1.2 Hz cycle for wail
    this.liveLfo = ctx.createOscillator();
    this.liveLfo.type = 'triangle';
    this.liveLfo.frequency.setValueAtTime(1.2, now);

    this.liveLfoGain = ctx.createGain();
    this.liveLfoGain.gain.setValueAtTime(160, now);

    this.liveLfo.connect(this.liveLfoGain);
    this.liveLfoGain.connect(this.liveOsc.frequency);

    // Master volume gain
    this.liveGain = ctx.createGain();
    this.liveGain.gain.setValueAtTime(Math.min(0.3, volume), now);

    this.liveOsc.connect(this.liveGain);
    this.liveGain.connect(ctx.destination);

    this.liveOsc.start(now);
    this.liveLfo.start(now);
    this._isPlayingLive = true;
  }

  /**
   * Stops only the live continuous simulation siren.
   */
  public stopLiveSiren(): void {
    this._isPlayingLive = false;
    try {
      if (this.liveOsc) {
        this.liveOsc.stop();
        this.liveOsc.disconnect();
        this.liveOsc = null;
      }
      if (this.liveLfo) {
        this.liveLfo.stop();
        this.liveLfo.disconnect();
        this.liveLfo = null;
      }
      if (this.liveLfoGain) {
        this.liveLfoGain.disconnect();
        this.liveLfoGain = null;
      }
      if (this.liveGain) {
        this.liveGain.disconnect();
        this.liveGain = null;
      }
    } catch {
      // ignore
    }
  }

  /**
   * Play a dedicated 2-second user test tone that cannot be canceled by simulation clock state.
   */
  public playTone(durationMs = 2000, volume = 0.22): void {
    if (this._isMuted) return;

    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    const run = () => {
      this.stopTestTone();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);

      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(1.3, now);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(160, now);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.08);
      gain.gain.setValueAtTime(volume, now + durationMs / 1000 - 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      lfo.start(now);

      this.testNodes = { osc, lfo, gain };

      this.testTimeoutId = setTimeout(() => {
        this.stopTestTone();
      }, durationMs + 50);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(run).catch(run);
    } else {
      run();
    }
  }

  public stopTestTone(): void {
    if (this.testTimeoutId) {
      clearTimeout(this.testTimeoutId);
      this.testTimeoutId = null;
    }
    if (this.testNodes) {
      try {
        this.testNodes.osc.stop();
        this.testNodes.lfo.stop();
        this.testNodes.osc.disconnect();
        this.testNodes.lfo.disconnect();
        this.testNodes.gain.disconnect();
      } catch {
        // ignore
      }
      this.testNodes = null;
    }
  }

  /**
   * Universal stop: stops both live siren and test preview.
   */
  public stop(): void {
    this.stopLiveSiren();
    this.stopTestTone();
  }
}

export const SirenAudioPreview = new SyntheticSirenPlayer();
