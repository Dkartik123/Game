import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3001;

// Store game rooms
const gameRooms = new Map();

// Serve static files
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create or join room
  socket.on('create-room', (playerName, callback) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      players: new Map(),
      gameState: null,
      isPlaying: false
    };
    
    room.players.set(socket.id, {
      id: socket.id,
      name: playerName,
      x: 100,
      y: 100,
      score: 0,
      health: 100,
      isAlive: true,
      powerUp: null,
      color: getPlayerColor(0)
    });

    gameRooms.set(roomCode, room);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    callback({ success: true, roomCode, playerId: socket.id });
    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  socket.on('join-room', (data, callback) => {
    const { roomCode, playerName } = data;
    const room = gameRooms.get(roomCode);

    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.isPlaying) {
      callback({ success: false, error: 'Game already in progress' });
      return;
    }

    if (room.players.size >= 4) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    // Check if name is already taken
    const nameTaken = Array.from(room.players.values()).some(p => p.name === playerName);
    if (nameTaken) {
      callback({ success: false, error: 'Name already taken' });
      return;
    }

    const playerIndex = room.players.size;
    room.players.set(socket.id, {
      id: socket.id,
      name: playerName,
      x: 100 + (playerIndex * 150),
      y: 100 + (playerIndex * 100),
      score: 0,
      health: 100,
      isAlive: true,
      powerUp: null,
      color: getPlayerColor(playerIndex)
    });

    socket.join(roomCode);
    socket.roomCode = roomCode;

    callback({ success: true, playerId: socket.id });

    // Notify all players in room
    io.to(roomCode).emit('player-joined', {
      players: Array.from(room.players.values())
    });

    console.log(`${playerName} joined room ${roomCode}`);
  });

  // Start game
  socket.on('start-game', () => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room || room.host !== socket.id) {
      return;
    }

    if (room.players.size < 2) {
      socket.emit('error', 'Need at least 2 players to start');
      return;
    }

    room.isPlaying = true;
    room.gameState = {
      orbs: generateOrbs(10),
      powerUps: [],
      startTime: Date.now(),
      duration: 180 // 3 minutes
    };

    io.to(roomCode).emit('game-started', {
      players: Array.from(room.players.values()),
      gameState: room.gameState
    });

    console.log(`Game started in room ${roomCode}`);
  });

  // Player movement
  socket.on('player-move', (position) => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room || !room.isPlaying) return;

    const player = room.players.get(socket.id);
    if (player && player.isAlive) {
      player.x = position.x;
      player.y = position.y;
      player.direction = position.direction;

      socket.to(roomCode).emit('player-moved', {
        playerId: socket.id,
        x: position.x,
        y: position.y,
        direction: position.direction
      });
    }
  });

  // Player attack
  socket.on('player-attack', () => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room || !room.isPlaying) return;

    io.to(roomCode).emit('player-attacked', {
      playerId: socket.id
    });
  });

  // Collect orb
  socket.on('collect-orb', (orbId) => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room || !room.isPlaying) return;

    const player = room.players.get(socket.id);
    if (player && player.isAlive) {
      const pointValue = player.powerUp === 'double-points' ? 20 : 10;
      player.score += pointValue;

      // Remove orb and spawn new one
      const orbIndex = room.gameState.orbs.findIndex(o => o.id === orbId);
      if (orbIndex !== -1) {
        room.gameState.orbs.splice(orbIndex, 1);
        room.gameState.orbs.push(generateOrb());
      }

      io.to(roomCode).emit('orb-collected', {
        playerId: socket.id,
        orbId,
        score: player.score,
        newOrb: room.gameState.orbs[room.gameState.orbs.length - 1]
      });
    }
  });

  // Hit player
  socket.on('hit-player', (targetId) => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room || !room.isPlaying) return;

    const attacker = room.players.get(socket.id);
    const target = room.players.get(targetId);

    if (attacker && target && target.isAlive && target.powerUp !== 'shield') {
      target.health -= 20;
      
      if (target.health <= 0) {
        target.isAlive = false;
        target.health = 0;
        // Transfer points
        const stolenPoints = Math.floor(target.score * 0.3);
        attacker.score += stolenPoints;
        target.score -= stolenPoints;
      } else {
        // Steal some points
        const stolenPoints = 5;
        if (target.score >= stolenPoints) {
          attacker.score += stolenPoints;
          target.score -= stolenPoints;
        }
      }

      io.to(roomCode).emit('player-hit', {
        attackerId: socket.id,
        targetId,
        attackerScore: attacker.score,
        targetHealth: target.health,
        targetScore: target.score,
        targetIsAlive: target.isAlive
      });
    }
  });

  // Collect power-up
  socket.on('collect-powerup', (powerUpId) => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room || !room.isPlaying) return;

    const player = room.players.get(socket.id);
    const powerUpIndex = room.gameState.powerUps.findIndex(p => p.id === powerUpId);

    if (player && powerUpIndex !== -1) {
      const powerUp = room.gameState.powerUps[powerUpIndex];
      player.powerUp = powerUp.type;
      room.gameState.powerUps.splice(powerUpIndex, 1);

      io.to(roomCode).emit('powerup-collected', {
        playerId: socket.id,
        powerUpId,
        powerUpType: powerUp.type
      });

      // Power-up expires after 10 seconds
      setTimeout(() => {
        if (player.powerUp === powerUp.type) {
          player.powerUp = null;
          io.to(roomCode).emit('powerup-expired', {
            playerId: socket.id
          });
        }
      }, 10000);
    }
  });

  // Pause game
  socket.on('pause-game', () => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room) return;

    const player = room.players.get(socket.id);
    io.to(roomCode).emit('game-paused', {
      playerId: socket.id,
      playerName: player?.name || 'Unknown'
    });
  });

  // Resume game
  socket.on('resume-game', () => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room) return;

    const player = room.players.get(socket.id);
    io.to(roomCode).emit('game-resumed', {
      playerId: socket.id,
      playerName: player?.name || 'Unknown'
    });
  });

  // Quit game
  socket.on('quit-game', () => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room) return;

    const player = room.players.get(socket.id);
    io.to(roomCode).emit('player-quit', {
      playerId: socket.id,
      playerName: player?.name || 'Unknown'
    });

    handlePlayerLeave(socket, room, roomCode);
  });

  // Restart game
  socket.on('restart-game', () => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room) return;

    const player = room.players.get(socket.id);
    
    // Notify all players about the restart request
    io.to(roomCode).emit('player-restarted', {
      playerId: socket.id,
      playerName: player?.name || 'Unknown'
    });

    // Reset player state for the requesting player
    if (player) {
      player.health = 100;
      player.isAlive = true;
      player.score = 0;
      player.powerUp = null;
      
      // Reset position
      const playerIndex = Array.from(room.players.keys()).indexOf(socket.id);
      player.x = 100 + (playerIndex * 150);
      player.y = 100 + (playerIndex * 100);
    }
  });

  // Game over
  socket.on('game-over', () => {
    const roomCode = socket.roomCode;
    const room = gameRooms.get(roomCode);

    if (!room || room.host !== socket.id) return;

    const players = Array.from(room.players.values());
    const winner = players.reduce((max, p) => p.score > max.score ? p : max, players[0]);

    io.to(roomCode).emit('game-ended', {
      winner: winner.name,
      finalScores: players.map(p => ({ name: p.name, score: p.score }))
    });

    room.isPlaying = false;
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    const roomCode = socket.roomCode;
    if (roomCode) {
      const room = gameRooms.get(roomCode);
      if (room) {
        handlePlayerLeave(socket, room, roomCode);
      }
    }
  });
});

function handlePlayerLeave(socket, room, roomCode) {
  const player = room.players.get(socket.id);
  room.players.delete(socket.id);

  if (room.players.size === 0) {
    gameRooms.delete(roomCode);
    console.log(`Room ${roomCode} deleted (empty)`);
  } else {
    // Transfer host if needed
    if (room.host === socket.id) {
      room.host = room.players.keys().next().value;
    }

    io.to(roomCode).emit('player-left', {
      playerId: socket.id,
      playerName: player?.name,
      players: Array.from(room.players.values()),
      newHost: room.host
    });

    // Check if game is playing and only 1 player left - end game
    if (room.isPlaying && room.players.size === 1) {
      const remainingPlayer = Array.from(room.players.values())[0];
      
      io.to(roomCode).emit('game-ended', {
        winner: remainingPlayer.name,
        finalScores: [{ name: remainingPlayer.name, score: remainingPlayer.score }],
        reason: 'All other players left the game'
      });

      room.isPlaying = false;
      console.log(`Game in room ${roomCode} ended - only one player remaining`);
    }
  }
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getPlayerColor(index) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF'];
  return colors[index % colors.length];
}

function generateOrbs(count) {
  const orbs = [];
  for (let i = 0; i < count; i++) {
    orbs.push(generateOrb());
  }
  return orbs;
}

function generateOrb() {
  // Generate coordinates in base 1600x1200 grid (will be scaled on client)
  return {
    id: Math.random().toString(36).substring(2, 15),
    x: Math.random() * 1500 + 50,  // Width range: 50 to 1550
    y: Math.random() * 1100 + 50   // Height range: 50 to 1150
  };
}

// Spawn power-ups periodically
setInterval(() => {
  gameRooms.forEach((room, roomCode) => {
    if (room.isPlaying && room.gameState.powerUps.length < 3) {
      const powerUpTypes = ['shield', 'speed', 'double-points', 'mega-attack'];
      const powerUp = {
        id: Math.random().toString(36).substring(2, 15),
        type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
        x: Math.random() * 1500 + 50,  // Width range: 50 to 1550 (base 1600 grid)
        y: Math.random() * 1100 + 50   // Height range: 50 to 1150 (base 1200 grid)
      };
      room.gameState.powerUps.push(powerUp);
      io.to(roomCode).emit('powerup-spawned', powerUp);
    }
  });
}, 15000); // Every 15 seconds

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});

