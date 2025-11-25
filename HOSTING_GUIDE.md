# Free Node.js Hosting Options for Puppeteer Apps

Running Puppeteer (headless Chrome) in the cloud can be challenging because it requires significant resources. Here are your best FREE options, ranked by ease of use:

---

## 🥇 RECOMMENDED: Render.com (Free Tier)

**Best overall option for Puppeteer apps**

### Pros:
- ✅ FREE tier available (750 hours/month)
- ✅ Officially supports Puppeteer
- ✅ Automatic deployments from GitHub
- ✅ Free SSL certificates
- ✅ Persistent storage available
- ✅ Good documentation

### Cons:
- ⚠️ Free tier spins down after 15 minutes of inactivity (cold starts ~30-60 seconds)
- ⚠️ Limited to 512MB RAM on free tier
- ⚠️ Slower performance compared to paid tiers

### Setup Instructions:

1. **Create a `render-build.sh` file in your project root:**

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Store/pull Puppeteer cache with build cache
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/
fi
```

2. **Make it executable:**
```bash
chmod +x render-build.sh
```

3. **Update your `server.js` to include the correct Chrome path:**

```javascript
const browser = await puppeteer.launch({
    executablePath: process.env.NODE_ENV === 'production' 
        ? '/opt/render/.cache/puppeteer/chrome/linux-133.0.6943.126/chrome-linux64/chrome'
        : undefined,
    headless: 'new',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
    ]
});
```

4. **Push to GitHub and connect to Render:**
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect your repository
   - Set Build Command: `./render-build.sh`
   - Set Start Command: `node server.js`
   - Add Environment Variable: `PUPPETEER_CACHE_DIR` = `/opt/render/.cache/puppeteer/chrome/`
   - Deploy!

**Cost:** FREE (with limitations)
**Website:** https://render.com

---

## 🥈 Railway.app (Free $5 Credit)

**Great developer experience**

### Pros:
- ✅ $5 free credit per month (usually enough for small projects)
- ✅ No cold starts
- ✅ Easy deployment from GitHub
- ✅ Good performance
- ✅ Simple configuration

### Cons:
- ⚠️ Credit-based (not truly unlimited free tier)
- ⚠️ Can run out of credits if heavily used

### Setup:
1. Sign up at https://railway.app
2. Connect GitHub repository
3. Railway auto-detects Node.js
4. Add environment variables if needed
5. Deploy!

**Cost:** FREE $5/month credit
**Website:** https://railway.app

---

## 🥉 Fly.io (Free Tier)

**More control, Docker-based**

### Pros:
- ✅ Real free tier (3 shared-cpu-1x VMs with 256MB RAM)
- ✅ No cold starts
- ✅ Supports Docker (better for Puppeteer)
- ✅ Multiple regions available

### Cons:
- ⚠️ Requires Docker knowledge
- ⚠️ More complex setup
- ⚠️ Limited resources on free tier

### Setup:
1. **Create a `Dockerfile`:**

```dockerfile
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

2. **Install Fly CLI and deploy:**
```bash
curl -L https://fly.io/install.sh | sh
fly launch
fly deploy
```

**Cost:** FREE (3 VMs)
**Website:** https://fly.io

---

## ⚠️ NOT RECOMMENDED FOR PUPPETEER

### Heroku
- ❌ No longer has a free tier (minimum $5/month)
- Used to be the go-to option, but now paid only

### Vercel / Netlify
- ❌ Serverless functions have 10-second timeout on free tier
- ❌ Not suitable for Puppeteer (needs longer execution time)
- ❌ Function size limits make Chromium difficult

### AWS Lambda
- ❌ Complex setup
- ❌ Size limits require custom Chrome builds
- ❌ Not beginner-friendly

---

## 💡 Alternative: Use a Managed Browser Service

Instead of hosting the whole app with Puppeteer, consider using a managed browser API:

### BrowserLess (Free Tier)
- Limited free usage
- No need to manage Chrome yourself
- Connect via WebSocket

```javascript
const puppeteer = require('puppeteer-core');

const browser = await puppeteer.connect({
  browserWSEndpoint: 'wss://chrome.browserless.io?token=YOUR_TOKEN'
});
```

**Website:** https://browserless.io

---

## 🎯 RECOMMENDATION FOR YOUR PROJECT

**For the UNC Health Doctor Finder Test App:**

**Best Choice: Render.com**

Why?
1. ✅ Officially supports Puppeteer
2. ✅ FREE tier is sufficient for testing/QA tool
3. ✅ Easy GitHub integration
4. ✅ Cold starts are acceptable for a testing tool (not a production API)
5. ✅ You can upgrade to paid if needed ($7/month removes cold starts)

### Quick Start with Render:

1. **Update your project** (add render-build.sh file as shown above)
2. **Push to GitHub**
3. **Sign up at Render.com**
4. **Create new Web Service**
5. **Connect your repo**
6. **Set environment variables:**
   - `PUPPETEER_CACHE_DIR` = `/opt/render/.cache/puppeteer/chrome/`
   - `NODE_ENV` = `production`
7. **Deploy!**

Your app will be live at `https://your-app-name.onrender.com`

---

## 💰 If You Can Spend ~$5-7/Month

If cold starts are unacceptable:

1. **Render.com Starter Plan** - $7/month (no cold starts, better performance)
2. **Railway.app** - ~$5-10/month depending on usage
3. **DigitalOcean App Platform** - $5/month (512MB RAM)

---

## 📝 Notes

- Puppeteer apps are resource-intensive (Chrome needs ~200-300MB RAM minimum)
- Free tiers work but expect slower performance
- For production/heavy usage, consider paid hosting ($5-20/month)
- Cold starts (15-60 seconds) are common on free tiers
- Test runs taking 10-30 seconds each are normal for Puppeteer

---

## 🔗 Useful Links

- Render Puppeteer Guide: https://render.com/docs/deploy-puppeteer-node
- Railway Documentation: https://docs.railway.app
- Fly.io Docker Guide: https://fly.io/docs/languages-and-frameworks/dockerfile/
- Puppeteer Documentation: https://pptr.dev/

---

## ✅ Quick Decision Guide

**Choose Render.com if:**
- You want the easiest setup
- Cold starts are acceptable (testing tool)
- You want official Puppeteer support
- Budget: $0

**Choose Railway.app if:**
- You want better performance
- No cold starts needed
- You're okay with $5/month credit limits
- Budget: $0-5/month

**Choose Fly.io if:**
- You know Docker
- You want more control
- You need multiple regions
- Budget: $0

**Choose paid hosting if:**
- You need consistent fast performance
- This is for production use
- Budget: $5-20/month
