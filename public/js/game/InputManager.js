export class InputManager {
  constructor(game) {
    this.game = game;
    this.keys = {};
    this.lastSentPosition = { x: 0, y: 0 };
    this.positionUpdateThrottle = 50; // ms
    this.lastPositionUpdate = 0;
    
    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Prevent default for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      this.keys[e.key.toLowerCase()] = true;
      
      // Handle special keys
      if (e.key === ' ' || e.key === 'Space') {
        this.handleAttack();
      }
      
      if (e.key.toLowerCase() === 'e') {
        this.handlePowerUpActivation();
      }
      
      if (e.key === 'Escape') {
        this.handleEscape();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  update(deltaTime) {
    if (!this.game.localPlayer || !this.game.localPlayer.isAlive) return;
    
    let dx = 0;
    let dy = 0;
    let direction = this.game.localPlayer.direction;
    
    // Check movement keys
    if (this.keys['arrowup'] || this.keys['w']) {
      dy = -1;
      direction = 'up';
    }
    if (this.keys['arrowdown'] || this.keys['s']) {
      dy = 1;
      direction = 'down';
    }
    if (this.keys['arrowleft'] || this.keys['a']) {
      dx = -1;
      direction = 'left';
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      dx = 1;
      direction = 'right';
    }
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }
    
    // Move player if there's input
    if (dx !== 0 || dy !== 0) {
      this.game.localPlayer.move(dx, dy, deltaTime);
      this.game.localPlayer.setDirection(direction);
      
      // Send position update to server (throttled)
      const now = Date.now();
      if (now - this.lastPositionUpdate > this.positionUpdateThrottle) {
        this.sendPositionUpdate();
        this.lastPositionUpdate = now;
      }
    }
  }

  sendPositionUpdate() {
    const player = this.game.localPlayer;
    
    // Only send if position changed significantly
    const dx = Math.abs(player.x - this.lastSentPosition.x);
    const dy = Math.abs(player.y - this.lastSentPosition.y);
    
    if (dx > 1 || dy > 1) {
      this.game.network.sendPosition(player.x, player.y, player.direction);
      this.lastSentPosition.x = player.x;
      this.lastSentPosition.y = player.y;
    }
  }

  handleAttack() {
    if (!this.game.localPlayer || !this.game.localPlayer.isAlive || this.game.isPaused) return;
    
    this.game.localPlayer.attack();
    this.game.network.attack();
    this.game.checkAttackCollisions(this.game.localPlayer);
  }

  handlePowerUpActivation() {
    // Power-ups are passive in this game, but this could be extended
  }

  handleEscape() {
    if (!this.game.isPaused) {
      window.battleArena.pauseGame();
    }
  }
}

