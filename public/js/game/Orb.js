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
    orb.style.transform = `translate(${this.x}px, ${this.y}px)`;
    orb.style.left = '0';
    orb.style.top = '0';
    
    arena.appendChild(orb);
    return orb;
  }

  remove() {
    if (this.element && this.element.parentElement) {
      // Animate removal
      this.element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      this.element.style.transform = `translate(${this.x}px, ${this.y - 50}px) scale(1.5)`;
      this.element.style.opacity = '0';
      
      setTimeout(() => {
        this.element.remove();
      }, 300);
    }
  }
}

