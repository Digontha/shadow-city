/**
 * Procedural Web Audio API sound synthesizer for Shadow City combat.
 * Generates instant, zero-asset sound effects: swings, impacts, crits, alarms, and level-ups.
 */
class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will initialize on first user gesture
  }

  private init(): boolean {
    if (!this.enabled) return false;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Melee weapon blade swoosh / slash
  public playSlash(weaponSpeed = 1): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380 * weaponSpeed, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.14 / weaponSpeed);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14 / weaponSpeed);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15 / weaponSpeed);
    } catch {
      // Audio safety
    }
  }

  // Flesh / Armor hit impact
  public playHit(isCrit = false): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // Punchy sub-bass thud
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(isCrit ? 180 : 130, now);
      sub.frequency.exponentialRampToValueAtTime(30, now + 0.12);

      subGain.gain.setValueAtTime(isCrit ? 0.45 : 0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + 0.13);

      // Noise spark on metal / cyber armor
      const bufferSize = this.ctx.sampleRate * 0.08;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = isCrit ? 'highpass' : 'bandpass';
      noiseFilter.frequency.setValueAtTime(isCrit ? 2400 : 1600, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(isCrit ? 0.4 : 0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);
    } catch {
      // Audio safety
    }
  }

  // Enemy detects player / Alert horn
  public playAlert(): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.setValueAtTime(640, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } catch {
      // Audio safety
    }
  }

  // Enemy death / Cyber disengage fizzle
  public playEnemyDeath(): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio safety
    }
  }

  // Level Up / Reward Stinger
  public playLevelUp(): void {
    if (!this.init() || !this.ctx) return;
    try {
      const notes = [329.63, 440, 554.37, 659.25]; // E4, A4, C#5, E5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      });
    } catch {
      // Audio safety
    }
  }

// Weapon switch sound
  public playWeaponSwitch(): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio safety
    }
  }

  // Player movement footsteps
  public playFootstep(isSprinting: boolean = false): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSprinting ? 120 : 90, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);

      gain.gain.setValueAtTime(isSprinting ? 0.08 : 0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // Sprint Dash / Kinetic slide swoosh
  public playDash(): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  // Environment sirens in distant city
  public playDistantSiren(): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.linearRampToValueAtTime(750, now + 0.4);
      osc.frequency.linearRampToValueAtTime(550, now + 0.8);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  // Neon sign electricity flicker / hum
  public playNeonHum(): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  // Vehicle ignition & acceleration rev
  public playEngineRev(): void {
    if (!this.init() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }
}

export const soundFX = new SoundFX();