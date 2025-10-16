n# Battle Arena Game - Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
cd battle-arena-game
npm install
```

### 2. Add Sound Effects (Optional)

Place MP3 sound files in `public/sounds/` directory:
- click.mp3
- game-start.mp3
- collect.mp3
- hit.mp3
- attack.mp3
- powerup.mp3
- game-over.mp3

See `public/sounds/README.md` for sources and recommendations.

### 3. Start the Server

```bash
npm start
```

The server will start on port 3000 by default.

### 4. Access the Game

**Local play:**
```
http://localhost:3000
```

**Multiplayer (same network):**

1. Find your local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Share this URL with other players:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

**Example:**
```
http://192.168.1.100:3000
```

### 5. Expose to Internet (Optional)

To play with friends over the internet, you can use:

#### Option A: ngrok (Recommended for testing)

1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. Share the generated URL (e.g., `https://abc123.ngrok.io`)

#### Option B: Deploy to Cloud

Deploy to platforms like:
- Heroku
- Railway.app
- Render.com
- DigitalOcean
- AWS/Azure/GCP

## How to Play

### Creating a Game

1. Click "Create Room"
2. Enter your name
3. Share the room code with friends
4. Wait for 2-4 players to join
5. Click "Start Game" when ready

### Joining a Game

1. Click "Join Room"
2. Enter your name
3. Enter the room code from the host
4. Wait for host to start

### Controls

- **Move**: Arrow Keys or WASD
- **Attack**: SPACE
- **Use Power-up**: E
- **Pause Menu**: ESC

### Objective

- Collect energy orbs (yellow spheres) to gain points
- Attack other players to steal their points
- Survive and have the highest score when time runs out
- Collect power-ups for temporary advantages:
  - 🛡️ Shield: Protection from attacks
  - ⚡ Speed: Move faster
  - 💰 Double Points: Earn 2x points from orbs
  - 💥 Mega Attack: Larger attack range

## Performance Tips

The game is optimized to run at 60 FPS using:

1. **CSS Transforms**: Hardware-accelerated rendering
2. **RequestAnimationFrame**: Smooth animation loop
3. **Throttled Network Updates**: Efficient multiplayer sync
4. **Minimal DOM Manipulation**: Performance-focused design

### Testing Performance

1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Record while playing
4. Check for:
   - Consistent 60 FPS
   - No long tasks (>50ms)
   - Smooth rendering

## Troubleshooting

### Players can't connect

1. Check firewall settings
2. Ensure all players are on same network (or using ngrok)
3. Verify server is running on correct port

### Audio not working

1. Check browser audio permissions
2. Add sound files to `public/sounds/`
3. Try different browser (Chrome recommended)

### Low FPS

1. Close other browser tabs
2. Disable browser extensions
3. Try in incognito mode
4. Check Task Manager for high CPU usage

### Network lag

1. Check internet connection
2. Reduce number of players
3. Use wired connection instead of WiFi
4. Host server closer to players

## Technical Details

### Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Backend**: Node.js + Express
- **Real-time**: Socket.io
- **Rendering**: DOM elements (no canvas)
- **Animation**: RequestAnimationFrame at 60 FPS

### Architecture

```
battle-arena-game/
├── public/
│   ├── index.html          # Main HTML
│   ├── styles.css          # All styles
│   ├── js/
│   │   ├── main.js         # Entry point
│   │   ├── game/
│   │   │   ├── Game.js     # Game engine
│   │   │   ├── Player.js   # Player entity
│   │   │   ├── Orb.js      # Energy orb
│   │   │   ├── PowerUp.js  # Power-up entity
│   │   │   └── InputManager.js
│   │   ├── network/
│   │   │   └── NetworkManager.js
│   │   ├── ui/
│   │   │   └── UIManager.js
│   │   └── audio/
│   │       └── AudioManager.js
│   └── sounds/             # Audio files
└── server.js               # WebSocket server
```

### Port Configuration

Default port is 3000. To change:

```bash
PORT=8080 npm start
```

Or modify `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

## License

ISC

## Support

For issues or questions, check:
1. Console logs (F12 in browser)
2. Server terminal output
3. Network tab in DevTools

