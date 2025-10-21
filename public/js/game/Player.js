export class Player {
  constructor(id, name, x, y, color, arena, isLocal = false) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.color = color;
    this.score = 0;
    this.health = 100;
    this.isAlive = true;
    this.powerUp = null;
    this.direction = 'down';
    this.isLocal = isLocal;
    
    // Movement
    this.speed = 200; // pixels per second
    this.velocityX = 0;
    this.velocityY = 0;
    
    // Interpolation for remote players
    this.targetX = x;
    this.targetY = y;
    this.interpolationSpeed = 0.2; // Smooth factor (0-1)
    
    // Attack cooldown
    this.lastAttackTime = 0;
    this.attackCooldown = 500; // 500ms between attacks
    
    this.element = this.createElement(arena);
  }

  createElement(arena) {
    const player = document.createElement('div');
    player.className = 'player';
    player.id = `player-${this.id}`;
    player.style.backgroundColor = this.color;
    player.style.borderColor = this.color;
    player.textContent = this.name[0].toUpperCase();
    player.style.left = `${this.x}px`;
    player.style.top = `${this.y}px`;
    
    // Name tag
    const nameTag = document.createElement('div');
    nameTag.className = 'player-name-tag';
    nameTag.textContent = this.name;
    player.appendChild(nameTag);
    
    // Health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'player-health-bar';
    const healthFill = document.createElement('div');
    healthFill.className = 'player-health-fill';
    healthFill.style.width = '100%';
    healthBar.appendChild(healthFill);
    player.appendChild(healthBar);
    
    arena.appendChild(player);
    return player;
  }

  setPosition(x, y) {
    if (this.isLocal) {
      // Local player - instant update
      this.x = x;
      this.y = y;
      this.targetX = x;
      this.targetY = y;
    } else {
      // Remote player - set target for interpolation
      this.targetX = x;
      this.targetY = y;
    }
  }

  setDirection(direction) {
    this.direction = direction;
  }

  move(dx, dy, deltaTime) {
    const speedMultiplier = this.powerUp === 'speed' ? 1.5 : 1;
    const actualSpeed = this.speed * speedMultiplier;
    
    this.velocityX = dx * actualSpeed;
    this.velocityY = dy * actualSpeed;
    
    this.x += this.velocityX * (deltaTime / 1000);
    this.y += this.velocityY * (deltaTime / 1000);
  }

  attack() {
    // Check cooldown
    const now = Date.now();
    if (now - this.lastAttackTime < this.attackCooldown) {
      return; // Attack on cooldown
    }
    this.lastAttackTime = now;
    
    // Add attacking animation
    if (this.element) {
      this.element.classList.add('attacking');
      setTimeout(() => {
        if (this.element) {
          this.element.classList.remove('attacking');
        }
      }, 300);
    }
    
    // Create attack effect safely
    if (this.element && this.element.parentElement) {
      const effect = document.createElement('div');
      effect.className = 'attack-effect';
      effect.style.left = `${this.x - 40}px`;
      effect.style.top = `${this.y - 40}px`;
      effect.style.borderColor = this.color;
      this.element.parentElement.appendChild(effect);
      
      setTimeout(() => {
        if (effect && effect.parentElement) {
          effect.remove();
        }
      }, 500);
    }
  }

  setPowerUp(powerUpType) {
    this.powerUp = powerUpType;
    this.element.classList.add(powerUpType);
    
    // Initialize speed particle tracking
    if (powerUpType === 'speed') {
      this.lastParticleTime = 0;
      this.particleInterval = 50; // Create particle every 50ms
    }
  }

  clearPowerUp() {
    if (this.powerUp) {
      this.element.classList.remove(this.powerUp);
      this.powerUp = null;
      this.lastParticleTime = 0;
    }
  }
  
  createSpeedParticle() {
    if (!this.element || !this.element.parentElement) return;
    
    const particle = document.createElement('div');
    particle.className = 'speed-particle';
    particle.style.backgroundColor = this.color;
    particle.style.left = `${this.x - 4}px`;
    particle.style.top = `${this.y - 4}px`;
    particle.style.boxShadow = `0 0 10px ${this.color}`;
    
    this.element.parentElement.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle && particle.parentElement) {
        particle.remove();
      }
    }, 500);
  }

  die() {
    this.isAlive = false;
    this.element.style.opacity = '0.3';
    this.element.style.filter = 'grayscale(100%)';
  }

  revive() {
    this.isAlive = true;
    this.health = 100;
    this.element.style.opacity = '1';
    this.element.style.filter = 'none';
    this.updateHealthBar();
  }

  updateHealthBar() {
    const healthFill = this.element.querySelector('.player-health-fill');
    if (healthFill) {
      healthFill.style.width = `${this.health}%`;
    }
  }
  
  update(deltaTime) {
    // Interpolate position for remote players
    if (!this.isLocal) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If far from target, move towards it smoothly
      if (distance > 0.5) {
        this.x += dx * this.interpolationSpeed;
        this.y += dy * this.interpolationSpeed;
      } else {
        // Snap to target if very close
        this.x = this.targetX;
        this.y = this.targetY;
      }
    }
    
    // Create speed particles if moving with speed boost
    if (this.powerUp === 'speed' && (this.velocityX !== 0 || this.velocityY !== 0)) {
      const now = Date.now();
      if (now - this.lastParticleTime >= this.particleInterval) {
        this.createSpeedParticle();
        this.lastParticleTime = now;
      }
    }
    
    // Update visual position (center the player at x,y coordinates)
    // Player is 40px wide, so offset by 20px to center
    this.element.style.left = `${this.x - 20}px`;
    this.element.style.top = `${this.y - 20}px`;
    
    // Update health bar
    this.updateHealthBar();
  }

  remove() {
    if (this.element && this.element.parentElement) {
      this.element.remove();
    }
  }
}

