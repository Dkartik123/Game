export class UIManager {
  constructor() {
    this.currentScreen = null;
    this.notificationTimeout = null;
  }

  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Show target screen
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = screenId;
    }

    // Clear inputs when showing create/join screens
    if (screenId === 'create-room-screen') {
      document.getElementById('create-player-name').value = '';
      document.getElementById('create-error').textContent = '';
    } else if (screenId === 'join-room-screen') {
      document.getElementById('join-player-name').value = '';
      document.getElementById('room-code-input').value = '';
      document.getElementById('join-error').textContent = '';
    }
  }

  showLobby(roomCode, playerId, isHost) {
    this.showScreen('lobby-screen');
    
    // Display room code
    document.getElementById('lobby-room-code').textContent = roomCode;
    
    // Enable/disable start button based on host status
    const startBtn = document.getElementById('start-game-btn');
    if (!isHost) {
      startBtn.style.display = 'none';
    } else {
      startBtn.style.display = 'inline-block';
      startBtn.disabled = true;
    }
    
    // Update lobby info
    const lobbyInfo = document.querySelector('.lobby-info');
    if (isHost) {
      lobbyInfo.textContent = 'You are the host. Waiting for players... (2-4 players needed)';
    } else {
      lobbyInfo.textContent = 'Waiting for host to start the game...';
    }
  }

  updateLobbyPlayers(players) {
    const playersList = document.getElementById('players-list');
    const playerCount = document.getElementById('player-count');
    
    playersList.innerHTML = '';
    playerCount.textContent = players.length;
    
    players.forEach((player, index) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.style.borderColor = player.color;
      
      card.innerHTML = `
        <div class="player-avatar" style="background-color: ${player.color}; border-color: ${player.color};">
          ${player.name[0].toUpperCase()}
        </div>
        <div class="player-name">${player.name}</div>
        ${index === 0 ? '<span class="host-badge">HOST</span>' : ''}
      `;
      
      playersList.appendChild(card);
    });
  }

  showGameMenu() {
    const overlay = document.getElementById('game-menu-overlay');
    overlay.classList.remove('hidden');
  }

  hideGameMenu() {
    const overlay = document.getElementById('game-menu-overlay');
    overlay.classList.add('hidden');
  }

  showGameOver(winner, finalScores) {
    this.showScreen('game-over-screen');
    
    // Display winner
    const winnerDisplay = document.getElementById('winner-display');
    winnerDisplay.textContent = `🏆 ${winner} WINS! 🏆`;
    
    // Display final scores
    const scoresList = document.getElementById('final-scores-list');
    scoresList.innerHTML = '';
    
    // Sort scores
    const sortedScores = [...finalScores].sort((a, b) => b.score - a.score);
    
    sortedScores.forEach((player, index) => {
      const scoreItem = document.createElement('div');
      scoreItem.className = 'final-score-item';
      if (index === 0) {
        scoreItem.classList.add('first');
      }
      
      const medals = ['🥇', '🥈', '🥉', '4️⃣'];
      
      scoreItem.innerHTML = `
        <span class="rank">${medals[index] || ''}</span>
        <span class="name">${player.name}</span>
        <span class="score">${player.score} pts</span>
      `;
      
      scoresList.appendChild(scoreItem);
    });
  }

  showError(message, elementId = 'join-error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      setTimeout(() => {
        errorElement.textContent = '';
      }, 3000);
    }
  }

  showMessage(message, type = 'info') {
    // Create temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `notification ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border-radius: 8px;
      border: 2px solid;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      font-weight: 600;
    `;
    
    // Set border color based on type
    const colors = {
      success: '#51CF66',
      error: '#FF6B6B',
      warning: '#FFE66D',
      info: '#6C5CE7'
    };
    messageDiv.style.borderColor = colors[type] || colors.info;
    
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      messageDiv.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        messageDiv.remove();
      }, 300);
    }, 3000);
  }

  showNotification(message, type = 'info') {
    // Show notification in game
    const messageOverlay = document.getElementById('message-overlay');
    const messageTitle = document.getElementById('message-title');
    const messageText = document.getElementById('message-text');
    
    const titles = {
      warning: '⚠️ Warning',
      info: 'ℹ️ Info',
      success: '✓ Success'
    };
    
    messageTitle.textContent = titles[type] || titles.info;
    messageText.textContent = message;
    
    messageOverlay.classList.remove('hidden');
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
      messageOverlay.classList.add('hidden');
    }, 2000);
  }
}

