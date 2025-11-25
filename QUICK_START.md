# 🚀 Quick Start Guide - UNC Health Doctor Finder Test Tool

## What You Have

A complete Node.js application that uses **real browser automation** (Puppeteer) to test the UNC Health "Find a Doctor" search functionality.

## Files Included

```
├── server.js                    # Main Node.js server with Puppeteer automation
├── package.json                 # Dependencies (Express, Puppeteer)
├── render-build.sh             # Build script for Render.com deployment
├── public/
│   └── index.html              # Web interface
├── README.md                    # Full documentation
├── HOSTING_GUIDE.md            # Detailed hosting options comparison
├── DEPLOYMENT_CHECKLIST.md     # Step-by-step deployment guide
└── find-a-doctor-test.php      # Original simulation version (reference)
```

## Two Options to Run This

### Option 1: Run Locally (Development)

**Requirements:**
- Node.js 14+ installed
- Terminal/Command prompt

**Steps:**
```bash
# 1. Navigate to project folder
cd /path/to/your/project

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open browser
http://localhost:3000
```

**Pros:** Free, instant, full control
**Cons:** Only accessible on your computer

---

### Option 2: Deploy to Cloud (Recommended)

**Best Option: Render.com (FREE)**

**Steps:**
1. Push project to GitHub
2. Sign up at https://render.com
3. Create new Web Service from your repo
4. Set build command: `./render-build.sh`
5. Set start command: `node server.js`
6. Add environment variable: `PUPPETEER_CACHE_DIR` = `/opt/render/.cache/puppeteer/chrome/`
7. Deploy!

**Result:** Your app accessible at `https://your-app-name.onrender.com`

**Pros:** Accessible anywhere, free SSL, auto-deployments
**Cons:** Cold starts after 15 min inactivity (30-60 sec delay)

📖 **Full deployment guide:** See `DEPLOYMENT_CHECKLIST.md`
📊 **Compare hosting options:** See `HOSTING_GUIDE.md`

---

## How to Use the Tool

1. **Open the app** (locally or hosted URL)
2. **Select a specialty** from dropdown
   - Or choose "Custom" and enter your own search terms
3. **Enter ZIP code** (optional) to narrow results by location
4. **Click "Run Live Search Test"**
5. **Wait 10-30 seconds** for real browser automation to complete
6. **View results:**
   - Total providers found
   - Accuracy percentage
   - List of irrelevant providers (if any)
   - Sample relevant providers

---

## What It Actually Does

1. ✅ Launches a real headless Chrome browser
2. ✅ Navigates to https://www.unchealth.org/care-services/doctors
3. ✅ Fills in the search form with specialty and ZIP code
4. ✅ Submits the search
5. ✅ Extracts provider names and specialties from results
6. ✅ Analyzes whether each provider matches the search terms
7. ✅ Generates accuracy report
8. ✅ Takes debug screenshot for troubleshooting

---

## Key Features

- **Real Testing** - Not a simulation; performs actual searches
- **ZIP Code Support** - Filter by location
- **Custom Specialties** - Test any specialty, not just predefined ones
- **Accuracy Analysis** - Shows which results don't match search criteria
- **Debug Screenshots** - Automatic screenshots saved as `debug-screenshot.png`
- **Detailed Logging** - Server console shows step-by-step execution

---

## Predefined Specialties

- Cardiology
- Dermatology
- Orthopedics
- Pediatrics
- Neurology

Each includes related search terms for matching (e.g., "cardiology" matches "cardiologist", "heart", "cardiac", etc.)

---

## Cost Breakdown

### Free Options:
- **Local Development:** $0
- **Render.com Free Tier:** $0 (with cold starts)
- **Railway.app:** $0 (with $5/month credit)
- **Fly.io:** $0 (limited resources)

### Paid Options (If You Outgrow Free):
- **Render.com Starter:** $7/month (no cold starts)
- **Railway.app:** ~$5-10/month usage-based
- **DigitalOcean:** $5/month

💡 **Recommendation:** Start with Render.com free tier. Upgrade only if cold starts become an issue.

---

## Troubleshooting

### "Chrome not found" error
- Check the `executablePath` in server.js
- Verify it matches the path in your deployment logs
- Different Chrome versions may have different paths

### No results found
- Check debug-screenshot.png to see what the browser saw
- The website structure may have changed
- Update selectors in server.js if needed

### Timeout errors
- First request after cold start takes 30-60 seconds (normal)
- Increase timeout values in server.js if needed

### Server crashes
- Puppeteer needs ~200-300MB RAM minimum
- Free tier limits may be too restrictive
- Consider upgrading plan or reducing concurrent tests

---

## Next Steps

### For Development:
1. ✅ Install dependencies: `npm install`
2. ✅ Run locally: `npm start`
3. ✅ Test it works: http://localhost:3000
4. ✅ Customize as needed

### For Production:
1. ✅ Read `DEPLOYMENT_CHECKLIST.md`
2. ✅ Push to GitHub
3. ✅ Deploy to Render.com
4. ✅ Test live app
5. ✅ Share with team

---

## Support & Documentation

📖 **Full Documentation:** See `README.md`
🏗️ **Hosting Options:** See `HOSTING_GUIDE.md`
✅ **Deployment Guide:** See `DEPLOYMENT_CHECKLIST.md`

---

## Quick Links

- **Render.com:** https://render.com
- **Puppeteer Docs:** https://pptr.dev
- **Node.js Download:** https://nodejs.org
- **GitHub:** https://github.com

---

## Estimated Time Investment

- **Local Setup:** 5-10 minutes
- **Cloud Deployment:** 15-20 minutes
- **Learning Curve:** Beginner-friendly

---

## Questions?

1. Check the README.md for detailed documentation
2. Review server logs for error messages
3. Look at debug-screenshot.png if tests fail
4. Consult the hosting guides for deployment issues

---

## 🎯 TL;DR

**To run locally:**
```bash
npm install && npm start
```

**To deploy to cloud:**
1. Push to GitHub
2. Connect to Render.com
3. Deploy with one click

**To use:**
1. Select specialty
2. Add ZIP (optional)
3. Click "Run Test"
4. View results

That's it! 🎉
