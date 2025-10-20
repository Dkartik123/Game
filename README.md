# Battle Arena Game

A real-time multiplayer browser battle arena game for 2-4 players.

## 🎮 Live Demo

**Play Now**: [https://game-iqra.onrender.com/](https://game-iqra.onrender.com/)

No installation required - just open the link and start playing with friends!

## Features

- **Real-time Multiplayer**: 2-4 players can join and play simultaneously
- **DOM-based Rendering**: No canvas, only DOM elements for compatibility
- **60 FPS Performance**: Smooth animations using requestAnimationFrame
- **Keyboard Controls**: Responsive WASD/Arrow key controls
- **Power-ups & Combat**: Collect resources and battle other players
- **In-game Menu**: Pause, resume, and quit functionality
- **Sound Effects**: Immersive audio feedback
- **Scoring System**: Real-time score tracking with winner announcement
- **Game Timer**: Countdown timer to determine match duration

## Gameplay

Players control their character in a battle arena, collecting energy orbs to increase their score. Players can attack each other to steal points. The player with the highest score when the timer runs out wins!

### Controls

- **Movement**: Arrow Keys or WASD
- **Attack**: Spacebar
- **Activate Power-up**: E key
- **Menu**: ESC key

### Power-ups

- **Shield**: Protects from attacks
- **Speed Boost**: Move faster
- **Double Points**: Earn 2x points from orbs
- **Mega Attack**: Powerful attack with larger range

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

4. Share your IP address with other players so they can join:
```
http://YOUR_IP:3000
```

## Game Modes

- **2 Players**: Head-to-head battle
- **3 Players**: Three-way competition
- **4 Players**: Full arena chaos

## Technical Details

- **Frontend**: Pure JavaScript (ES6+), HTML5, CSS3
- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.io
- **Animation**: requestAnimationFrame at 60 FPS
- **Rendering**: DOM elements only (no canvas)

## Performance

The game maintains a constant 60 FPS by:
- Using efficient DOM manipulation
- Minimizing layout reflows
- Optimizing CSS with transforms
- Proper use of requestAnimationFrame
- Debouncing non-critical updates

## License

ISC

