# 🚀 Deployment Guide - Battle Arena Game

## Quick Deploy on Render.com (Free & Easy)

### Step 1: Push Code to Gitea
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Render.com

1. **Go to** [Render.com](https://render.com) and sign up/login
2. **Click** "New +" → "Web Service"
3. **Connect** your Gitea repository:
   - URL: `https://gitea.kood.tech/denislomakin/web-game`
4. **Configure**:
   - Name: `battle-arena-game` (or any name)
   - Region: Choose closest to you
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**

5. **Click** "Create Web Service"

6. **Wait** ~2-5 minutes for deployment

7. **Your game URL** will be: `https://battle-arena-game-XXXX.onrender.com`

---

## Alternative: Railway.app (Also Free & Simple)

1. **Go to** [Railway.app](https://railway.app)
2. **Login** with GitHub
3. **New Project** → "Deploy from GitHub repo"
4. **Select** your repository
5. **Click Deploy** - that's it!
6. **Get your URL** from the deployment page

---

## Alternative: Vercel (Free, but for static + serverless)

Not recommended for this project because it requires WebSocket support.

---

## Testing Deployment

After deployment, test with multiple devices:
- ✅ Open URL on your phone
- ✅ Open URL on another computer
- ✅ Create a room and share the code
- ✅ Test gameplay with 2-4 players

---

## Troubleshooting

### Port Issues
Server already uses `process.env.PORT` ✅

### WebSocket Connection
Make sure the hosting platform supports WebSockets:
- ✅ Render.com - YES
- ✅ Railway.app - YES
- ❌ Vercel - NO (requires upgrade)

### CORS Issues
None expected for this setup ✅

---

## Current Configuration

- **Repository**: https://gitea.kood.tech/denislomakin/web-game
- **Port**: Dynamic (uses process.env.PORT)
- **Build**: `npm install`
- **Start**: `npm start`
- **Ready for deployment**: ✅
