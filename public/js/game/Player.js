export class Player {
  constructor(id, name, x, y, color, arena) {
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
    
    // Movement
    this.speed = 200; // pixels per second
    this.velocityX = 0;
    this.velocityY = 0;
    
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
    this.x = x;
    this.y = y;
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
    this.element.classList.add('attacking');
    setTimeout(() => {
      this.element.classList.remove('attacking');
    }, 300);
    
    // Create attack effect
    const effect = document.createElement('div');
    effect.className = 'attack-effect';
    effect.style.left = `${this.x - 40}px`;
    effect.style.top = `${this.y - 40}px`;
    effect.style.borderColor = this.color;
    this.element.parentElement.appendChild(effect);
    
    setTimeout(() => {
      effect.remove();
    }, 500);
  }

  setPowerUp(powerUpType) {
    this.powerUp = powerUpType;
    this.element.classList.add(powerUpType);
  }

  clearPowerUp() {
    if (this.powerUp) {
      this.element.classList.remove(this.powerUp);
      this.powerUp = null;
    }
  }

  die() {
    this.isAlive = false;
    this.element.style.opacity = '0.3';
    this.element.style.filter = 'grayscale(100%)';
  }

  update(deltaTime) {
    // Update visual position using transform for better performance
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    this.element.style.left = '0';
    this.element.style.top = '0';
    
    // Update health bar
    const healthFill = this.element.querySelector('.player-health-fill');
    if (healthFill) {
      healthFill.style.width = `${this.health}%`;
    }
  }

  remove() {
    if (this.element && this.element.parentElement) {
      this.element.remove();
    }
  }
}

