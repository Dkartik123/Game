export class PowerUp {
  constructor(id, type, x, y, arena) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.element = this.createElement(arena);
  }

  createElement(arena) {
    const powerUp = document.createElement('div');
    powerUp.className = `powerup ${this.type}`;
    powerUp.id = `powerup-${this.id}`;
    powerUp.style.left = `${this.x}px`;
    powerUp.style.top = `${this.y}px`;
    
    // Add icon based on type
    const icons = {
      'shield': '🛡️',
      'speed': '⚡',
      'double-points': '💰',
      'mega-attack': '💥'
    };
    
    powerUp.textContent = icons[this.type] || '⭐';
    
    arena.appendChild(powerUp);
    return powerUp;
  }

  remove() {
    if (this.element && this.element.parentElement) {
      // Animate removal
      this.element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      this.element.style.transform = 'scale(0)';
      this.element.style.opacity = '0';
      
      setTimeout(() => {
        this.element.remove();
      }, 300);
    }
  }
}

