# Render.com Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Prepare Your Project
- [ ] Ensure all files are in your project directory:
  - `server.js`
  - `package.json`
  - `render-build.sh`
  - `public/index.html`
  - `README.md`

### 2. Test Locally
```bash
npm install
npm start
```
- [ ] Verify the app works on http://localhost:3000
- [ ] Test a search to make sure Puppeteer works locally

### 3. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - UNC Health Doctor Finder Test Tool"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 🚀 Render.com Deployment Steps

### 4. Create Render.com Account
- [ ] Go to https://render.com
- [ ] Sign up with GitHub (recommended)

### 5. Create New Web Service
- [ ] Click "New +" button
- [ ] Select "Web Service"
- [ ] Connect your GitHub repository
- [ ] Grant Render access to your repo

### 6. Configure Service Settings

**Basic Settings:**
- [ ] **Name:** `unc-doctor-finder-test` (or your preferred name)
- [ ] **Region:** Choose closest to you
- [ ] **Branch:** `main`
- [ ] **Runtime:** `Node`

**Build & Deploy:**
- [ ] **Build Command:** `./render-build.sh`
- [ ] **Start Command:** `node server.js`

### 7. Add Environment Variables
Click "Environment" tab and add:

- [ ] **Variable:** `PUPPETEER_CACHE_DIR`
      **Value:** `/opt/render/.cache/puppeteer/chrome/`

- [ ] **Variable:** `NODE_ENV`
      **Value:** `production`

### 8. Choose Plan
- [ ] Select **"Free"** tier
- [ ] Acknowledge:
  - Service spins down after 15 min inactivity
  - 750 hours/month limit
  - Slower performance

### 9. Deploy!
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (5-10 minutes first time)
- [ ] Watch the logs for any errors

## ✅ Post-Deployment

### 10. Test Your Live App
- [ ] Open your app URL: `https://your-app-name.onrender.com`
- [ ] Select a specialty (e.g., "Cardiology")
- [ ] Optionally add a ZIP code
- [ ] Click "Run Live Search Test"
- [ ] Wait 30-60 seconds (first request takes longer)
- [ ] Verify results are displayed

### 11. Troubleshooting
If you encounter errors:

**Check Render logs:**
- [ ] Go to your service dashboard
- [ ] Click "Logs" tab
- [ ] Look for error messages

**Common Issues:**

1. **Chrome not found error:**
   - Check the `executablePath` in server.js matches your logs
   - The path might be different (check logs for actual path)
   - Update server.js if needed

2. **Build fails:**
   - Ensure `render-build.sh` is executable
   - Check that file has Unix line endings (not Windows)

3. **App crashes:**
   - Check memory usage in logs
   - Puppeteer needs ~200-300MB minimum

4. **Timeout errors:**
   - First request after cold start takes 30-60 seconds
   - This is normal on free tier
   - Subsequent requests are faster

## 📊 Monitor Your App

### Usage Stats (Free Tier Limits)
- [ ] Check usage: Dashboard → Your Service → Metrics
- **Hours/month:** 750 hours max
- **Memory:** 512MB RAM
- **CPU:** Shared CPU

### Important Notes:
⚠️ **Cold Starts:** After 15 minutes of inactivity, service spins down. Next request takes 30-60 seconds to wake up.

✅ **Auto-Deploy:** Every push to GitHub main branch triggers a new deployment automatically.

## 🔄 Updating Your App

To deploy changes:
```bash
git add .
git commit -m "Your update message"
git push origin main
```
Render automatically rebuilds and deploys.

## 🆙 Upgrade Options

If free tier is too slow:

**Starter Plan - $7/month:**
- No cold starts
- Faster CPU
- Better performance
- 512MB RAM (can upgrade more)

To upgrade:
- [ ] Go to your service dashboard
- [ ] Click "Settings"
- [ ] Under "Instance Type" select "Starter"
- [ ] Confirm

## 🔗 Your App URLs

After deployment, save these:

- **App URL:** `https://your-app-name.onrender.com`
- **Dashboard:** https://dashboard.render.com
- **Logs:** https://dashboard.render.com/web/[your-service-id]/logs

## 📝 Next Steps

- [ ] Bookmark your app URL
- [ ] Share with your team
- [ ] Set up monitoring if needed
- [ ] Consider upgrading if cold starts are an issue

## ✨ Success!

Your UNC Health Find a Doctor testing tool is now live and accessible from anywhere! 🎉

---

## Need Help?

- Render Documentation: https://render.com/docs
- Puppeteer on Render: https://render.com/docs/deploy-puppeteer-node
- Community Forum: https://community.render.com

---

**Estimated Deployment Time:** 15-20 minutes
**Skill Level Required:** Beginner-Intermediate
