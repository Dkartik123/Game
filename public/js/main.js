import { Game } from './game/Game.js';
import { UIManager } from './ui/UIManager.js';
import { NetworkManager } from './network/NetworkManager.js';
import { AudioManager } from './audio/AudioManager.js';

class BattleArenaGame {
  constructor() {
    this.ui = new UIManager();
    this.audio = new AudioManager();
    this.network = new NetworkManager(this.audio);
    this.game = null;
    this.currentScreen = 'main-menu';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.ui.showScreen('main-menu');
  }

  setupEventListeners() {
    // Main menu buttons
    document.getElementById('create-room-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.ui.showScreen('create-room-screen');
    });

    document.getElementById('join-room-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.ui.showScreen('join-room-screen');
    });

    // Create room screen
    document.getElementById('confirm-create-btn').addEventListener('click', () => {
      this.handleCreateRoom();
    });

    document.getElementById('back-from-create-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.ui.showScreen('main-menu');
    });

    // Join room screen
    document.getElementById('confirm-join-btn').addEventListener('click', () => {
      this.handleJoinRoom();
    });

    document.getElementById('back-from-join-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.ui.showScreen('main-menu');
    });

    // Lobby screen
    document.getElementById('start-game-btn').addEventListener('click', () => {
      this.network.startGame();
    });

    document.getElementById('leave-lobby-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.handleLeaveLobby();
    });

    document.getElementById('copy-code-btn').addEventListener('click', () => {
      const roomCode = document.getElementById('lobby-room-code').textContent;
      navigator.clipboard.writeText(roomCode);
      this.ui.showMessage('Code copied to clipboard!', 'success');
    });

    // Game menu buttons
    document.getElementById('menu-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.pauseGame();
    });

    document.getElementById('resume-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.resumeGame();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.restartGame();
    });

    document.getElementById('quit-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.quitGame();
    });

    // Game over buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      // Request game restart from server
      this.network.restartGame();
    });

    document.getElementById('main-menu-btn').addEventListener('click', () => {
      this.audio.playSound('click');
      this.network.disconnect();
      this.ui.showScreen('main-menu');
    });

    // Enter key handlers
    document.getElementById('create-player-name').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleCreateRoom();
    });

    document.getElementById('room-code-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleJoinRoom();
    });

    // Network event listeners
    this.network.on('room-created', (data) => {
      this.ui.showLobby(data.roomCode, data.playerId, true);
    });

    this.network.on('room-joined', (data) => {
      this.ui.showLobby(data.roomCode, data.playerId, false);
    });

    this.network.on('players-updated', (players) => {
      this.ui.updateLobbyPlayers(players);
      const startBtn = document.getElementById('start-game-btn');
      startBtn.disabled = players.length < 2;
    });

    this.network.on('game-started', (data) => {
      this.audio.playSound('game-start');
      this.startGame(data);
    });

    this.network.on('game-ended', (data) => {
      this.endGame(data);
    });

    this.network.on('player-quit', (data) => {
      // Only show notification if it's not the local player
      if (data.playerId !== this.network.playerId) {
        this.ui.showNotification(`${data.playerName} quit the game`, 'warning');
      }
    });

    this.network.on('game-restarted', (data) => {
      // Full game restart for all players
      console.log('Game restarting with fresh state...');
      
      // Hide pause menu overlay immediately
      this.ui.hideGameMenu();
      
      // Completely stop and cleanup current game
      if (this.game) {
        this.game.stop();
        this.game = null;
      }
      
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        this.audio.playSound('game-start');
        // Start completely fresh game
        this.startGame(data);
      }, 100);
    });

    this.network.on('player-left', (data) => {
      this.ui.showNotification(`${data.playerName} left the lobby`, 'warning');
      if (this.game) {
        this.game.removePlayer(data.playerId);
      }
    });

    this.network.on('error', (message) => {
      this.ui.showError(message);
    });
  }

  handleCreateRoom() {
    const playerName = document.getElementById('create-player-name').value.trim();
    
    if (!playerName) {
      this.ui.showError('Please enter your name', 'create-error');
      return;
    }

    if (playerName.length < 2) {
      this.ui.showError('Name must be at least 2 characters', 'create-error');
      return;
    }

    this.audio.playSound('click');
    this.network.createRoom(playerName);
  }

  handleJoinRoom() {
    const playerName = document.getElementById('join-player-name').value.trim();
    const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
    
    if (!playerName) {
      this.ui.showError('Please enter your name', 'join-error');
      return;
    }

    if (!roomCode) {
      this.ui.showError('Please enter room code', 'join-error');
      return;
    }

    if (playerName.length < 2) {
      this.ui.showError('Name must be at least 2 characters', 'join-error');
      return;
    }

    this.audio.playSound('click');
    this.network.joinRoom(roomCode, playerName);
  }

  handleLeaveLobby() {
    this.network.disconnect();
    this.ui.showScreen('main-menu');
  }

  startGame(data) {
    this.ui.showScreen('game-screen');
    
    // Create new game instance
    this.game = new Game(
      data.players,
      data.gameState,
      this.network,
      this.audio
    );
    
    this.game.start();
  }

  pauseGame() {
    if (this.game && !this.game.isPaused) {
      this.game.pause();
      this.network.pauseGame();
      this.ui.showGameMenu();
    }
  }

  resumeGame() {
    if (this.game && this.game.isPaused) {
      this.game.resume();
      this.network.resumeGame();
      this.ui.hideGameMenu();
    }
  }

  restartGame() {
    // Send restart request to server (will trigger game-restarted event)
    this.network.restartGame();
    
    // Hide menu immediately
    this.ui.hideGameMenu();
  }

  quitGame() {
    if (this.game) {
      this.game.stop();
      this.game = null;
    }
    this.network.quitGame();
    this.ui.showScreen('main-menu');
  }

  endGame(data) {
    this.audio.playSound('game-over');
    
    if (this.game) {
      this.game.stop();
      this.game = null;
    }

    this.ui.showGameOver(data.winner, data.finalScores, data.reason);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.battleArena = new BattleArenaGame();
});

