/**
 * Procedural Cyberpunk Synthwave & Ambient Background Music Engine
 * Zero external audio assets required. Synthesizes basslines, synth leads,
 * retro arpeggios, and district-reactive atmosphere via Web Audio API.
 */
class MusicManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private currentDistrict: string = 'Neon Promenade';
  private timerId: number | null = null;
  private step: number = 0;
  private volume: number = 0.5;

  // Cyberpunk synthwave chords & bass scales (Minor pentatonic / Dorian)
  private readonly notes = {
    C2: 65.41,
    D2: 73.42,
    Eb2: 77.78,
    F2: 87.31,
    G2: 98.0,
    Ab2: 103.83,
    Bb2: 116.54,
    C3: 130.81,
    Eb3: 155.56,
    F3: 174.61,
    G3: 196.0,
    Bb3: 233.08,
    C4: 261.63,
    D4: 293.66,
    Eb4: 311.13,
    F4: 349.23,
    G4: 392.0,
  };

  private bassPattern: number[] = [];
  private leadPattern: number[] = [];

  constructor() {
    this.generatePatterns();
  }

  private generatePatterns(): void {
    const { C2, Eb2, F2, G2, Bb2 } = this.notes;
    this.bassPattern = [C2, C2, Eb2, C2, F2, F2, G2, Bb2, C2, C2, Eb2, C2, Bb2, G2, F2, Eb2];
    const { C4, Eb4, G4, Bb3, D4, F4 } = this.notes;
    this.leadPattern = [C4, 0, Eb4, G4, 0, Bb3, D4, 0, F4, Eb4, C4, 0, G4, 0, Eb4, D4];
  }

  private initAudio(): boolean {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx && !!this.masterGain;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public start(): void {
    if (this.isPlaying) return;
    if (!this.initAudio()) return;

    this.isPlaying = true;
    this.step = 0;

    // 116 BPM Cyberpunk Sequencer step interval (approx 129ms per 16th note)
    const stepIntervalMs = 129;
    this.timerId = window.setInterval(() => {
      this.playSequencerStep();
    }, stepIntervalMs);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setDistrict(districtName: string): void {
    if (this.currentDistrict !== districtName) {
      this.currentDistrict = districtName;
    }
  }

  private playSequencerStep(): void {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const idx = this.step % 16;

    // 1. Synth Bass Note (Analog sawtooth with resonant filter)
    const bassFreq = this.bassPattern[idx];
    if (bassFreq) {
      try {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 0.12);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
      } catch {}
    }

    // 2. High Cyber Lead Arpeggio
    const leadFreq = this.leadPattern[idx];
    if (leadFreq > 0) {
      try {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(0.09, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        leadOsc.connect(leadGain);
        leadGain.connect(this.masterGain);
        leadOsc.start(now);
        leadOsc.stop(now + 0.22);
      } catch {}
    }

    // 3. Cybernetic Hi-Hat / Snare Rhythm (Every 2nd beat & off-beats)
    if (idx % 2 === 0) {
      try {
        const bufferSize = this.ctx.sampleRate * 0.03;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const hatSource = this.ctx.createBufferSource();
        hatSource.buffer = noiseBuffer;

        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(7000, now);

        const hatGain = this.ctx.createGain();
        const isSnare = idx === 4 || idx === 12;
        hatGain.gain.setValueAtTime(isSnare ? 0.12 : 0.035, now);
        hatGain.gain.exponentialRampToValueAtTime(0.001, now + (isSnare ? 0.08 : 0.03));

        hatSource.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.masterGain);
        hatSource.start(now);
      } catch {}
    }

    this.step++;
  }
}

export const musicManager = new MusicManager();