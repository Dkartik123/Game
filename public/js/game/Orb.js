export class Orb {
  constructor(id, x, y, arena) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.element = this.createElement(arena);
  }

  createElement(arena) {
    const orb = document.createElement('div');
    orb.className = 'orb';
    orb.id = `orb-${this.id}`;
    orb.style.left = `${this.x}px`;
    orb.style.top = `${this.y}px`;
    
    arena.appendChild(orb);
    return orb;
  }

  remove() {
    if (this.element && this.element.parentElement) {
      // Animate removal
      this.element.style.transition = 'top 0.3s ease, transform 0.3s ease, opacity 0.3s ease';
      this.element.style.top = `${this.y - 50}px`;
      this.element.style.transform = 'scale(1.5)';
      this.element.style.opacity = '0';
      
      setTimeout(() => {
        this.element.remove();
      }, 300);
    }
  }
}

