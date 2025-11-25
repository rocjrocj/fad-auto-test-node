const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Specialty test configurations
const specialtyTests = [
    {
        name: 'Cardiology',
        terms: ['cardiology', 'cardiologist', 'heart', 'cardiac', 'cardiovascular'],
        description: 'Heart and cardiovascular specialists'
    },
    {
        name: 'Dermatology',
        terms: ['dermatology', 'dermatologist', 'skin', 'dermatologic'],
        description: 'Skin specialists'
    },
    {
        name: 'Orthopedics',
        terms: ['orthopedic', 'orthopedics', 'orthopaedic', 'bone', 'joint', 'sports medicine'],
        description: 'Bone and joint specialists'
    },
    {
        name: 'Pediatrics',
        terms: ['pediatric', 'pediatrics', 'child', 'children', 'adolescent'],
        description: 'Children\'s health specialists'
    },
    {
        name: 'Neurology',
        terms: ['neurology', 'neurologist', 'brain', 'nerve', 'neurological'],
        description: 'Brain and nervous system specialists'
    }
];

// API endpoint to run the test
app.post('/api/runTest', async (req, res) => {
    try {
        const { specialty, customTerms, zipCode } = req.body;
        
        // Find the specialty configuration
        let testConfig = specialtyTests.find(test => test.name === specialty);
        
        // Handle custom specialty
        if (specialty === 'Custom' && customTerms) {
            const terms = customTerms.split(',').map(t => t.trim()).filter(t => t);
            testConfig = {
                name: 'Custom Search',
                terms: terms,
                description: 'Custom specialty search'
            };
        }
        
        if (!testConfig) {
            return res.status(400).json({ error: 'Invalid specialty selected' });
        }
        
        // Perform the actual search
        const result = await performRealSearch(testConfig, zipCode);
        
        res.json({
            success: true,
            specialty: testConfig.name,
            description: testConfig.description,
            zipCode: zipCode || '',
            timestamp: new Date().toISOString(),
            results: result
        });
        
    } catch (error) {
        console.error('Error running test:', error);
        res.status(500).json({ 
            error: 'Failed to run test: ' + error.message 
        });
    }
});

// Function to perform real search using Puppeteer
async function performRealSearch(config, zipCode = '') {
    let browser = null;
    
    try {
        // Launch browser with production-ready configuration
        const launchOptions = {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        };

        // On production (Render.com), use environment-based path detection
        if (process.env.NODE_ENV === 'production') {
            // Puppeteer installs Chrome here by default on Render
            launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                '/opt/render/project/.render/chrome/opt/google/chrome/chrome';
        }

        console.log('Launching browser with options:', launchOptions);
        browser = await puppeteer.launch(launchOptions);
        
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Navigate to the Find a Doctor page
        console.log('Navigating to UNC Health Find a Doctor...');
        await page.goto('https://www.unchealth.org/care-services/doctors', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Wait for the page to load
        await page.waitForTimeout(3000);
        
        // Try to find and fill in the specialty search field
        console.log('Looking for search fields...');
        
        // This selector may need adjustment based on the actual page structure
        // We'll try multiple possible selectors
        const specialtySelectors = [
            'input[placeholder*="specialty" i]',
            'input[placeholder*="condition" i]',
            'input[name*="specialty"]',
            'input[aria-label*="specialty" i]',
            '#specialty',
            '[data-testid*="specialty"]'
        ];
        
        let specialtyInput = null;
        for (const selector of specialtySelectors) {
            try {
                specialtyInput = await page.$(selector);
                if (specialtyInput) {
                    console.log(`Found specialty input with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!specialtyInput) {
            console.log('Could not find specialty input field');
            throw new Error('Could not find specialty search field on the page');
        }
        
        // Type the specialty
        const searchTerm = config.name;
        console.log(`Typing specialty: ${searchTerm}`);
        await specialtyInput.click();
        await page.keyboard.type(searchTerm, { delay: 100 });
        await page.waitForTimeout(1000);
        
        // Fill in ZIP code if provided
        if (zipCode) {
            console.log(`Looking for ZIP code field...`);
            const zipSelectors = [
                'input[placeholder*="zip" i]',
                'input[placeholder*="location" i]',
                'input[name*="zip"]',
                'input[name*="location"]',
                '#location',
                '#zip'
            ];
            
            let zipInput = null;
            for (const selector of zipSelectors) {
                try {
                    zipInput = await page.$(selector);
                    if (zipInput) {
                        console.log(`Found ZIP input with selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (zipInput) {
                console.log(`Typing ZIP code: ${zipCode}`);
                await zipInput.click();
                await page.keyboard.type(zipCode, { delay: 100 });
                await page.waitForTimeout(1000);
            }
        }
        
        // Try to find and click the search button
        console.log('Looking for search button...');
        const searchButtonSelectors = [
            'button[type="submit"]',
            'button:has-text("Search")',
            'button:has-text("Find")',
            'input[type="submit"]',
            '[data-testid*="search"]',
            'button.search-button'
        ];
        
        let searchButton = null;
        for (const selector of searchButtonSelectors) {
            try {
                searchButton = await page.$(selector);
                if (searchButton) {
                    console.log(`Found search button with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (searchButton) {
            await searchButton.click();
            console.log('Clicked search button, waiting for results...');
            await page.waitForTimeout(5000); // Wait for results to load
        } else {
            // Try pressing Enter
            console.log('No search button found, pressing Enter...');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(5000);
        }
        
        // Extract provider results from the page
        console.log('Extracting provider information...');
        const providers = await page.evaluate(() => {
            const results = [];
            
            // Try to find provider cards - these selectors may need adjustment
            const providerElements = document.querySelectorAll('[class*="provider"], [class*="doctor"], [class*="physician"], [data-testid*="provider"]');
            
            providerElements.forEach(element => {
                // Try to extract name
                const nameElement = element.querySelector('[class*="name"], h2, h3, h4, a[href*="provider"]');
                const name = nameElement ? nameElement.textContent.trim() : '';
                
                // Try to extract specialty
                const specialtyElement = element.querySelector('[class*="specialty"], [class*="title"]');
                const specialty = specialtyElement ? specialtyElement.textContent.trim() : '';
                
                // Get all text content for analysis
                const fullText = element.textContent.toLowerCase();
                
                if (name) {
                    results.push({
                        name,
                        specialty,
                        fullText
                    });
                }
            });
            
            return results;
        });
        
        console.log(`Found ${providers.length} providers`);
        
        // Analyze results for relevancy
        const analysisResult = analyzeProviders(providers, config);
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
        console.log('Screenshot saved to debug-screenshot.png');
        
        return analysisResult;
        
    } catch (error) {
        console.error('Error during search:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Analyze providers for relevancy
function analyzeProviders(providers, config) {
    const terms = config.terms.map(t => t.toLowerCase());
    let relevantCount = 0;
    let irrelevantCount = 0;
    const analyzedProviders = [];
    
    providers.forEach(provider => {
        const fullText = provider.fullText;
        const specialty = provider.specialty.toLowerCase();
        
        // Check if any of the terms match
        let isRelevant = false;
        let matchedTerm = '';
        
        for (const term of terms) {
            if (fullText.includes(term) || specialty.includes(term)) {
                isRelevant = true;
                matchedTerm = term;
                break;
            }
        }
        
        if (isRelevant) {
            relevantCount++;
        } else {
            irrelevantCount++;
        }
        
        analyzedProviders.push({
            name: provider.name,
            specialty: provider.specialty,
            relevant: isRelevant,
            matchedTerm: matchedTerm,
            snippet: provider.fullText.substring(0, 150) + '...'
        });
    });
    
    const total = providers.length;
    const accuracy = total > 0 ? Math.round((relevantCount / total) * 100 * 10) / 10 : 0;
    
    return {
        total,
        relevant: relevantCount,
        irrelevant: irrelevantCount,
        accuracy,
        providers: analyzedProviders
    };
}

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get available specialties
app.get('/api/specialties', (req, res) => {
    res.json(specialtyTests);
});

// Start server
app.listen(PORT, () => {
    console.log(`UNC Health Find a Doctor Testing Tool running on http://localhost:${PORT}`);
    console.log('Make sure you have Puppeteer installed: npm install puppeteer express');
});
