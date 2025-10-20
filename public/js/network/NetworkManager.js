export class NetworkManager {
  constructor(audio) {
    this.socket = null;
    this.audio = audio;
    this.listeners = new Map();
    this.connected = false;
    this.roomCode = null;
    this.playerId = null;
    this.arenaWidth = 1600;   // Base dimensions for coordinate scaling
    this.arenaHeight = 1200;
    
    this.connect();
  }

  connect() {
    // Socket.io is loaded via script tag in HTML
    this.socket = io();
    
    this.socket.on('connect', () => {
      this.connected = true;
      this.playerId = this.socket.id;
      console.log('Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
    });

    this.socket.on('error', (message) => {
      this.emit('error', message);
    });

    // Game events
    this.socket.on('player-joined', (data) => {
      this.emit('players-updated', data.players);
    });

    this.socket.on('player-left', (data) => {
      this.emit('player-left', data);
      this.emit('players-updated', data.players);
    });

    this.socket.on('game-started', (data) => {
      this.emit('game-started', data);
    });

    this.socket.on('player-moved', (data) => {
      this.emit('player-moved', data);
    });

    this.socket.on('player-attacked', (data) => {
      this.emit('player-attacked', data);
    });

    this.socket.on('orb-collected', (data) => {
      this.emit('orb-collected', data);
    });

    this.socket.on('powerup-spawned', (data) => {
      this.emit('powerup-spawned', data);
    });

    this.socket.on('powerup-collected', (data) => {
      this.emit('powerup-collected', data);
    });

    this.socket.on('powerup-expired', (data) => {
      this.emit('powerup-expired', data);
    });

    this.socket.on('player-hit', (data) => {
      this.emit('player-hit', data);
    });

    this.socket.on('game-paused', (data) => {
      this.emit('game-paused', data);
    });

    this.socket.on('game-resumed', (data) => {
      this.emit('game-resumed', data);
    });

    this.socket.on('player-quit', (data) => {
      this.emit('player-quit', data);
    });

    this.socket.on('player-restarted', (data) => {
      this.emit('player-restarted', data);
    });

    this.socket.on('game-ended', (data) => {
      this.emit('game-ended', data);
    });
    
    this.socket.on('game-restarted', (data) => {
      this.emit('game-restarted', data);
    });
    
    this.socket.on('timer-sync', (data) => {
      this.emit('timer-sync', data);
    });
  }

  // Event emitter pattern
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Room management
  createRoom(playerName) {
    this.socket.emit('create-room', playerName, (response) => {
      if (response.success) {
        this.roomCode = response.roomCode;
        this.playerId = response.playerId;
        this.emit('room-created', response);
      } else {
        this.emit('error', response.error || 'Failed to create room');
      }
    });
  }

  joinRoom(roomCode, playerName) {
    this.socket.emit('join-room', { roomCode, playerName }, (response) => {
      if (response.success) {
        this.roomCode = roomCode;
        this.playerId = response.playerId;
        this.emit('room-joined', { roomCode, playerId: response.playerId });
      } else {
        this.emit('error', response.error || 'Failed to join room');
      }
    });
  }

  startGame() {
    this.socket.emit('start-game');
  }

  // Game actions
  sendPosition(x, y, direction) {
    if (this.connected) {
      // Scale coordinates back to base 1600x1200 grid for server
      // Get actual arena dimensions
      const arena = document.getElementById('game-arena');
      const arenaWidth = arena.clientWidth;
      const arenaHeight = arena.clientHeight;
      const scaledX = (x / arenaWidth) * 1600;
      const scaledY = (y / arenaHeight) * 1200;
      this.socket.emit('player-move', { x: scaledX, y: scaledY, direction });
    }
  }

  attack() {
    if (this.connected) {
      this.socket.emit('player-attack');
    }
  }

  collectOrb(orbId) {
    if (this.connected) {
      this.socket.emit('collect-orb', orbId);
    }
  }

  collectPowerUp(powerUpId) {
    if (this.connected) {
      this.socket.emit('collect-powerup', powerUpId);
    }
  }

  hitPlayer(targetId) {
    if (this.connected) {
      this.socket.emit('hit-player', targetId);
    }
  }

  pauseGame() {
    if (this.connected) {
      this.socket.emit('pause-game');
    }
  }

  resumeGame() {
    if (this.connected) {
      this.socket.emit('resume-game');
    }
  }

  quitGame() {
    if (this.connected) {
      this.socket.emit('quit-game');
    }
  }

  restartGame() {
    if (this.connected) {
      this.socket.emit('restart-game');
    }
  }

  gameOver() {
    if (this.connected) {
      this.socket.emit('game-over');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
    this.roomCode = null;
  }
}

