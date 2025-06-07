// Audio utility for playing sound effects
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private soundDirectories: {
    [key: string]: string[]
  } = {
    'catapult': [],
    'explosion': []
  };
  private currentSoundIndex: {
    [key: string]: number
  } = {
    'catapult': 0,
    'explosion': 0
  };

  constructor() {
    // Wait for user interaction before initializing audio
    this.waitForUserInteraction();
  }

  private async waitForUserInteraction() {
    // Wait for any user interaction
    await new Promise(resolve => {
      const listener = (event: Event) => {
        document.removeEventListener('click', listener);
        document.removeEventListener('touchstart', listener);
        resolve(event);
      };
      document.addEventListener('click', listener);
      document.addEventListener('touchstart', listener);
    });

    // Initialize audio context
    await this.initAudioContext();
    
    // Load sounds after audio context is ready
    await this.loadSoundsFromDirectory('/lovable-uploads/catapult-sounds/');
    await this.loadSoundsFromDirectory('/lovable-uploads/explosion-sounds/');
  }

  private async initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
    return this.audioContext;
  }

  async loadSoundsFromDirectory(directory: string) {
    try {
      // For Vite, we'll load the specific sound files we know exist
      const type = directory.includes('catapult') ? 'catapult' : 'explosion';
      const sounds = directory.includes('catapult') 
        ? [
            '/lovable-uploads/catapult-sounds/trump-they-came-all-over.mp3',
            '/lovable-uploads/catapult-sounds/trump_chyna.mp3',
            '/lovable-uploads/catapult-sounds/trump_coming.mp3'
          ]
        : [
            '/lovable-uploads/explosion-sounds/congratulations-trump.mp3',
            '/lovable-uploads/explosion-sounds/donaldtrump-bye-bing.mp3'
          ];

      // If this is a catapult sound, make sure we load them correctly
      if (type === 'catapult') {
        console.log('Loading catapult sounds:', sounds);
        for (const [index, sound] of sounds.entries()) {
          console.log(`Loading catapult sound ${index}:`, sound);
          await this.loadAudio(sound, `catapult-${index}`);
        }
      }
      
      // First clear any existing sounds for this type
      this.soundDirectories[type] = [];
      this.currentSoundIndex[type] = 0;
      
      // Load each sound file
      for (const [index, sound] of sounds.entries()) {
        try {
          await this.loadAudio(sound, `${type}-${index}`);
          this.soundDirectories[type].push(sound);
        } catch (error) {
          console.error(`Failed to load sound ${sound}:`, error);
        }
      }

      console.log(`Loaded ${this.soundDirectories[type].length} ${type} sounds`);
    } catch (error) {
      console.error(`Error loading sounds from ${directory}:`, error);
    }
  }

  private async loadAudio(url: string, name: string): Promise<void> {
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

  public async playSound(name: string, volume: number = 1): Promise<void> {
    try {
      await this.initAudioContext();
      if (!this.audioContext) {
        console.warn('AudioContext not initialized');
        return;
      }

      // If sound isn't loaded, try to find it in the directory
      if (!this.audioBuffers.has(name)) {
        const [type, index] = name.split('-');
        const directory = type === 'catapult' ? '/lovable-uploads/catapult-sounds/' : '/lovable-uploads/explosion-sounds/';
        
        // Get the specific sound file name from our list
        const sounds = this.soundDirectories[type];
        if (sounds && index !== 'NaN' && parseInt(index) < sounds.length) {
          const soundPath = sounds[parseInt(index)];
          await this.loadAudio(soundPath, name);
        }
      }

      if (!this.audioBuffers.has(name)) {
        console.warn(`Audio not found: ${name}`);
        return;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffers.get(name);
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
    }
  }

  async playRandomSound(type: string): Promise<void> {
    // Get next sound in sequence for the given type
    const soundIndex = this.currentSoundIndex[type];
    this.currentSoundIndex[type] = (this.currentSoundIndex[type] + 1) % this.soundDirectories[type].length;
    
    // Make sure we have sounds loaded before trying to play
    if (this.soundDirectories[type].length === 0) {
      console.warn(`No ${type} sounds loaded`);
      return;
    }
    
    // Play the sound
    await this.playSound(`${type}-${soundIndex}`);
  }
}

// Create singleton instance
export const audioManager = new AudioManager();
