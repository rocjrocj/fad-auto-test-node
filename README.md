# UNC Health Find a Doctor - Real Search Accuracy Tester

This is an automated testing tool that performs **real browser automation** to test the accuracy of the UNC Health "Find a Doctor" search functionality. Unlike the simulation version, this tool actually launches a headless browser, navigates to the website, fills in the search form, and analyzes the returned results.

## Features

- ✅ **Real Browser Testing** - Uses Puppeteer to automate a real Chrome browser
- 🔍 **Specialty Search** - Tests predefined specialties or custom search terms
- 📍 **Location Filtering** - Optional ZIP code filtering
- 📊 **Accuracy Analysis** - Analyzes whether returned providers match the search criteria
- 📸 **Debug Screenshots** - Automatically captures screenshots for troubleshooting
- 🎨 **Modern UI** - Clean, responsive interface with real-time results

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Extract or navigate to the project directory**
   ```bash
   cd unc-health-doctor-finder-tester
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This will install:
   - `express` - Web server framework
   - `puppeteer` - Headless browser automation (includes Chromium)

## Usage

1. **Start the server**
   ```bash
   npm start
   ```

2. **Open your browser**
   Navigate to: `http://localhost:3000`

3. **Run a test**
   - Select a specialty from the dropdown (or choose "Custom" to enter your own terms)
   - Optionally enter a ZIP code to narrow results
   - Click "Run Live Search Test"
   - Wait 10-30 seconds for the test to complete

4. **View results**
   - The tool will display total providers found
   - Show accuracy percentage (relevant vs irrelevant results)
   - List potentially irrelevant providers that need review
   - Show sample relevant providers

## How It Works

1. **Browser Launch** - Puppeteer launches a headless Chrome browser
2. **Navigation** - Navigates to https://www.unchealth.org/care-services/doctors
3. **Form Filling** - Automatically fills in the specialty and ZIP code fields
4. **Search Execution** - Clicks the search button or presses Enter
5. **Data Extraction** - Extracts provider names, specialties, and descriptions
6. **Analysis** - Checks if each provider matches the search terms
7. **Reporting** - Displays accuracy metrics and detailed results

## Predefined Specialties

The tool includes these pre-configured specialties:
- Cardiology
- Dermatology
- Orthopedics
- Pediatrics
- Neurology

Each specialty includes relevant search terms for matching (e.g., "cardiology", "cardiologist", "heart", "cardiac", "cardiovascular")

## Troubleshooting

### Test returns 0 results
The UNC Health website may have changed its structure. Check:
- `debug-screenshot.png` - Shows what the browser saw
- Server console logs - Shows detailed step-by-step execution
- The page selectors in `server.js` may need updating

### Puppeteer installation issues
If Puppeteer fails to download Chromium:
```bash
npm install puppeteer --unsafe-perm=true --allow-root
```

### Port 3000 already in use
Change the PORT in `server.js`:
```javascript
const PORT = 3001; // or any available port
```

## File Structure

```
unc-health-doctor-finder-tester/
├── server.js           # Main Node.js server with Puppeteer automation
├── package.json        # Node.js dependencies and scripts
├── public/
│   └── index.html     # Frontend UI
└── README.md          # This file
```

## Customization

### Adding More Specialties
Edit the `specialtyTests` array in `server.js`:

```javascript
const specialtyTests = [
    {
        name: 'Your Specialty',
        terms: ['term1', 'term2', 'term3'],
        description: 'Description of specialty'
    },
    // ... more specialties
];
```

### Adjusting Timeouts
If the website is slow, increase wait times in `server.js`:

```javascript
await page.waitForTimeout(5000); // Increase from 3000 to 5000ms
```

### Updating Selectors
If the website structure changes, update the selectors in the `performRealSearch` function:

```javascript
const specialtySelectors = [
    'input[placeholder*="specialty" i]',
    // Add more selectors here
];
```

## Development Mode

For development with auto-restart on file changes:

```bash
npm run dev
```

This requires the `nodemon` package (included in devDependencies).

## Notes

- Tests take 10-30 seconds depending on page load time and number of results
- The tool creates a `debug-screenshot.png` file for troubleshooting
- Results are analyzed based on matching search terms in provider profiles
- This is a testing/QA tool and should not be used to scrape or store provider data

## License

ISC

## Support

If you encounter issues:
1. Check the server console for detailed logs
2. Review the `debug-screenshot.png` file
3. Verify the UNC Health website is accessible
4. Ensure selectors match the current page structure
