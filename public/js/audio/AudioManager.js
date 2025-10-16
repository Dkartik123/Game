export class AudioManager {
  constructor() {
    this.sounds = {
      'click': document.getElementById('audio-menu-click'),
      'game-start': document.getElementById('audio-game-start'),
      'collect': document.getElementById('audio-collect'),
      'hit': document.getElementById('audio-hit'),
      'attack': document.getElementById('audio-attack'),
      'powerup': document.getElementById('audio-powerup'),
      'game-over': document.getElementById('audio-game-over')
    };
    
    this.enabled = true;
    this.volume = 0.5;
    
    // Set initial volume
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.volume = this.volume;
      }
    });
  }

  playSound(soundName) {
    if (!this.enabled) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      // Reset sound to beginning if already playing
      sound.currentTime = 0;
      
      // Play with error handling
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Audio playback failed:', error);
        });
      }
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.volume = this.volume;
      }
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  mute() {
    this.enabled = false;
  }

  unmute() {
    this.enabled = true;
  }
}

