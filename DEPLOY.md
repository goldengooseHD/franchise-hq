# FRANCHISE HQ — Deploy Guide

## What You're Deploying

A free, live Madden franchise dashboard that:
- Receives data directly from the Madden Companion App
- Stores standings, rosters, and weekly stats in a database
- Serves a live dashboard any league mate can view in their browser
- Auto-refreshes every 30 seconds

---

## Option 1: Railway (Recommended — Easiest)

**Total time: ~5 minutes. No coding required.**

### Step 1: Push Code to GitHub

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **+** button → **New repository**
3. Name it `franchise-hq`, keep it **Public**, click **Create repository**
4. On your computer, open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
cd franchise-hq
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/franchise-hq.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `franchise-hq` repository
4. Railway will auto-detect Node.js and start building
5. Once deployed, click **Settings** → **Networking** → **Generate Domain**
6. You'll get a URL like `franchise-hq-production-xxxx.up.railway.app`

### Step 3: Add Persistent Storage

1. In your Railway project, click **+ New** → **Volume**
2. Set mount path to: `/app`
3. This ensures your SQLite database persists between deploys

### Step 4: Export from Madden

1. Open the **Madden Companion App** on your phone
2. Go to **Franchises** → select **The Showers**
3. Tap **Export** (bottom right)
4. In the **Web URL for Export** field, paste your Railway URL:
   ```
   https://franchise-hq-production-xxxx.up.railway.app
   ```
5. Check all the boxes (League Info, Rosters, Weekly Stats)
6. Select your week and tap **EXPORT**
7. Visit your URL in a browser — your data is live!

---

## Option 2: Render.com (Also Free)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New** → **Web Service**
3. Connect your `franchise-hq` repo
4. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Under **Disks**, add a disk:
   - **Mount Path**: `/opt/render/project/src`
   - **Size**: 1 GB
6. Click **Create Web Service**
7. You'll get a URL like `franchise-hq.onrender.com`

**Note**: Render free tier spins down after 15 min of inactivity. First visit after idle takes ~30 seconds to wake up. Railway doesn't have this issue.

---

## Option 3: Run Locally (For Testing)

If you just want to test it on your own computer:

```bash
cd franchise-hq
npm install
npm start
```

Visit `http://localhost:3000` in your browser.

To receive exports from the Companion App locally, you'd need to expose your local server to the internet using a tool like [ngrok](https://ngrok.com):

```bash
npx ngrok http 3000
```

This gives you a temporary public URL to paste into the Companion App.

---

## Sharing with Your League

Once deployed, just share the URL with your 9 league mates. They can:
- View standings, rosters, and stats from any browser
- No login or account needed
- Dashboard auto-refreshes every 30 seconds

As commissioner, you're the one who runs the export from the Companion App after each advance. Everyone else just visits the URL.

---

## Troubleshooting

**Export fails in the Companion App**
- Make sure your URL does NOT have a trailing slash
- Make sure the app has internet access
- Try exporting fewer data types at once (start with just League Info)

**Data not showing up on dashboard**
- Check the **Setup** tab → **Export Log** to see if data was received
- The Companion App sometimes takes a minute to finish sending all data
- Rosters are the largest export and take the longest

**Railway/Render deployment fails**
- Make sure all files are pushed to GitHub (server.js, package.json, public/index.html, Dockerfile)
- Check the build logs for errors
- `better-sqlite3` requires native compilation — the Dockerfile handles this

**Database gets corrupted**
- Use the **Reset All Data** button in the Setup tab
- Or delete the `franchise.db` file and restart the server

---

## Project Structure

```
franchise-hq/
├── server.js          # Express server — catches exports + serves API + dashboard
├── package.json       # Dependencies (express, better-sqlite3, cors)
├── Dockerfile         # Container config for Railway/Render
├── render.yaml        # Render.com deployment config
├── .gitignore         # Excludes node_modules and database file
├── DEPLOY.md          # This file
└── public/
    └── index.html     # Dashboard frontend (single-page app)
```

The entire app is 2 files that matter: `server.js` (backend) and `public/index.html` (frontend). Everything else is deployment config.
