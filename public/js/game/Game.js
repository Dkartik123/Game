import { Player } from './Player.js';
import { Orb } from './Orb.js';
import { PowerUp } from './PowerUp.js';
import { InputManager } from './InputManager.js';

export class Game {
  constructor(players, gameState, network, audio) {
    this.players = new Map();
    this.orbs = [];
    this.powerUps = [];
    this.network = network;
    this.audio = audio;
    
    this.arena = document.getElementById('game-arena');
    this.arenaWidth = 800;
    this.arenaHeight = 600;
    
    this.localPlayerId = network.socket.id;
    this.localPlayer = null;
    
    this.isPaused = false;
    this.isRunning = false;
    this.animationFrameId = null;
    
    // Performance tracking
    this.lastFrameTime = 0;
    this.fps = 60;
    this.fpsUpdateInterval = 1000;
    this.lastFpsUpdate = 0;
    this.frameCount = 0;
    
    // Timer
    this.gameStartTime = gameState.startTime;
    this.gameDuration = gameState.duration;
    
    this.inputManager = new InputManager(this);
    
    this.initializePlayers(players);
    this.initializeOrbs(gameState.orbs);
    
    this.setupNetworkListeners();
  }

  initializePlayers(playersData) {
    playersData.forEach(playerData => {
      const player = new Player(
        playerData.id,
        playerData.name,
        playerData.x,
        playerData.y,
        playerData.color,
        this.arena
      );
      
      this.players.set(playerData.id, player);
      
      if (playerData.id === this.localPlayerId) {
        this.localPlayer = player;
      }
    });
  }

  initializeOrbs(orbsData) {
    orbsData.forEach(orbData => {
      const orb = new Orb(orbData.id, orbData.x, orbData.y, this.arena);
      this.orbs.push(orb);
    });
  }

  setupNetworkListeners() {
    this.network.on('player-moved', (data) => {
      const player = this.players.get(data.playerId);
      if (player && data.playerId !== this.localPlayerId) {
        player.setPosition(data.x, data.y);
        player.setDirection(data.direction);
      }
    });

    this.network.on('player-attacked', (data) => {
      const player = this.players.get(data.playerId);
      if (player) {
        player.attack();
        this.audio.playSound('attack');
        this.checkAttackCollisions(player);
      }
    });

    this.network.on('orb-collected', (data) => {
      const orbIndex = this.orbs.findIndex(o => o.id === data.orbId);
      if (orbIndex !== -1) {
        this.orbs[orbIndex].remove();
        this.orbs.splice(orbIndex, 1);
        
        // Add new orb
        const newOrb = new Orb(data.newOrb.id, data.newOrb.x, data.newOrb.y, this.arena);
        this.orbs.push(newOrb);
      }
      
      const player = this.players.get(data.playerId);
      if (player) {
        player.score = data.score;
      }
      
      this.audio.playSound('collect');
      this.updateScoreboard();
    });

    this.network.on('powerup-spawned', (data) => {
      const powerUp = new PowerUp(data.id, data.type, data.x, data.y, this.arena);
      this.powerUps.push(powerUp);
    });

    this.network.on('powerup-collected', (data) => {
      const powerUpIndex = this.powerUps.findIndex(p => p.id === data.powerUpId);
      if (powerUpIndex !== -1) {
        this.powerUps[powerUpIndex].remove();
        this.powerUps.splice(powerUpIndex, 1);
      }
      
      const player = this.players.get(data.playerId);
      if (player) {
        player.setPowerUp(data.powerUpType);
        
        if (data.playerId === this.localPlayerId) {
          this.showPowerUpIndicator(data.powerUpType);
        }
      }
      
      this.audio.playSound('powerup');
    });

    this.network.on('powerup-expired', (data) => {
      const player = this.players.get(data.playerId);
      if (player) {
        player.clearPowerUp();
        
        if (data.playerId === this.localPlayerId) {
          this.hidePowerUpIndicator();
        }
      }
    });

    this.network.on('player-hit', (data) => {
      const target = this.players.get(data.targetId);
      if (target) {
        target.health = data.targetHealth;
        target.score = data.targetScore;
        target.isAlive = data.targetIsAlive;
        
        if (!target.isAlive) {
          target.die();
        }
      }
      
      const attacker = this.players.get(data.attackerId);
      if (attacker) {
        attacker.score = data.attackerScore;
      }
      
      this.audio.playSound('hit');
      this.updateScoreboard();
    });
  }

  start() {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = this.lastFrameTime;
    this.gameLoop(this.lastFrameTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.cleanup();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.lastFrameTime = performance.now();
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    // Calculate delta time
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }

    if (!this.isPaused) {
      this.update(deltaTime);
      this.render();
    }

    // Request next frame
    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    // Update timer
    this.updateTimer();
    
    // Update local player movement
    if (this.localPlayer && this.localPlayer.isAlive) {
      this.inputManager.update(deltaTime);
      
      // Check boundaries
      this.constrainPlayerPosition(this.localPlayer);
      
      // Check collisions with orbs
      this.checkOrbCollisions();
      
      // Check collisions with power-ups
      this.checkPowerUpCollisions();
    }
    
    // Update all players
    this.players.forEach(player => {
      player.update(deltaTime);
    });
  }

  render() {
    // DOM updates are handled automatically through CSS transforms
    // No manual rendering needed for 60 FPS with DOM elements
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
    const remaining = Math.max(0, this.gameDuration - elapsed);
    
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    
    const timerDisplay = document.getElementById('timer-value');
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timer-display');
    if (remaining <= 30 && remaining > 0) {
      timerElement.classList.add('warning');
    } else {
      timerElement.classList.remove('warning');
    }
    
    // End game when timer runs out
    if (remaining === 0 && this.isRunning) {
      this.network.gameOver();
    }
  }

  updateScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = '';
    
    const sortedPlayers = Array.from(this.players.values())
      .sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
      const scoreItem = document.createElement('div');
      scoreItem.className = 'score-item';
      if (index === 0) {
        scoreItem.classList.add('leading');
      }
      
      scoreItem.innerHTML = `
        <div class="score-avatar" style="background-color: ${player.color}; border-color: ${player.color};">
          ${player.name[0].toUpperCase()}
        </div>
        <div class="score-name">${player.name}</div>
        <div class="score-value">${player.score}</div>
      `;
      
      scoreboard.appendChild(scoreItem);
    });
  }

  constrainPlayerPosition(player) {
    const margin = 20;
    player.x = Math.max(margin, Math.min(this.arenaWidth - margin, player.x));
    player.y = Math.max(margin, Math.min(this.arenaHeight - margin, player.y));
  }

  checkOrbCollisions() {
    if (!this.localPlayer) return;
    
    this.orbs.forEach(orb => {
      const distance = this.getDistance(
        this.localPlayer.x,
        this.localPlayer.y,
        orb.x,
        orb.y
      );
      
      if (distance < 30) {
        this.network.collectOrb(orb.id);
      }
    });
  }

  checkPowerUpCollisions() {
    if (!this.localPlayer) return;
    
    this.powerUps.forEach(powerUp => {
      const distance = this.getDistance(
        this.localPlayer.x,
        this.localPlayer.y,
        powerUp.x,
        powerUp.y
      );
      
      if (distance < 35) {
        this.network.collectPowerUp(powerUp.id);
      }
    });
  }

  checkAttackCollisions(attacker) {
    const attackRange = attacker.powerUp === 'mega-attack' ? 100 : 60;
    
    this.players.forEach(target => {
      if (target.id !== attacker.id && target.isAlive) {
        const distance = this.getDistance(
          attacker.x,
          attacker.y,
          target.x,
          target.y
        );
        
        if (distance < attackRange) {
          if (attacker.id === this.localPlayerId) {
            this.network.hitPlayer(target.id);
          }
        }
      }
    });
  }

  getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  showPowerUpIndicator(powerUpType) {
    const indicator = document.getElementById('power-up-indicator');
    const nameElement = document.getElementById('power-up-name');
    
    const names = {
      'shield': '🛡️ Shield Active',
      'speed': '⚡ Speed Boost',
      'double-points': '💰 Double Points',
      'mega-attack': '💥 Mega Attack'
    };
    
    nameElement.textContent = names[powerUpType] || powerUpType;
    indicator.classList.remove('hidden');
    
    // Animate countdown bar
    const bar = document.getElementById('power-up-bar-fill');
    bar.style.width = '100%';
    bar.style.transition = 'width 10s linear';
    setTimeout(() => {
      bar.style.width = '0%';
    }, 50);
  }

  hidePowerUpIndicator() {
    const indicator = document.getElementById('power-up-indicator');
    indicator.classList.add('hidden');
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.remove();
      this.players.delete(playerId);
      this.updateScoreboard();
    }
  }

  cleanup() {
    // Remove all game objects
    this.players.forEach(player => player.remove());
    this.orbs.forEach(orb => orb.remove());
    this.powerUps.forEach(powerUp => powerUp.remove());
    
    this.players.clear();
    this.orbs = [];
    this.powerUps = [];
    
    // Clear arena
    this.arena.innerHTML = '';
  }
}

