
// Audio utility for playing sound effects
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Initialize AudioContext on first user interaction
    this.initAudioContext();
    // Load the custom sound file
    this.loadCustomSound();
  }

  private async initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
  }

  private async loadCustomSound() {
    // Load the custom sound file from the provided URL
    await this.loadAudio('https://jumpshare.com/s/KOk2Jn3IIlrHZF6oHOSq', 'trump-tariff');
  }

  async loadAudio(url: string, name: string): Promise<void> {
    try {
      await this.initAudioContext();
      if (!this.audioContext) return;

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.audioBuffers.set(name, audioBuffer);
      console.log(`Audio loaded: ${name}`);
    } catch (error) {
      console.error(`Failed to load audio ${name}:`, error);
    }
  }

  async playSound(name: string, volume: number = 1): Promise<void> {
    try {
      await this.initAudioContext();
      if (!this.audioContext || !this.audioBuffers.has(name)) {
        console.warn(`Audio not found: ${name}`);
        return;
      }

      const audioBuffer = this.audioBuffers.get(name)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      console.log(`Playing sound: ${name}`);
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
    }
  }

  // Play the custom Trump tariff sound
  async playTrumpTariff(): Promise<void> {
    try {
      await this.initAudioContext();
      
      // Try to play the loaded custom audio first
      if (this.audioBuffers.has('trump-tariff')) {
        await this.playSound('trump-tariff', 0.7);
        return;
      }

      // Fallback: Use speech synthesis if custom audio fails to load
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Tariff');
        utterance.rate = 0.8;
        utterance.pitch = 0.8;
        utterance.volume = 0.7;
        speechSynthesis.speak(utterance);
        console.log('Playing speech synthesis fallback: Tariff');
      }
    } catch (error) {
      console.error('Failed to play Trump tariff sound:', error);
    }
  }
}

// Create singleton instance
export const audioManager = new AudioManager();
