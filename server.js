const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
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

// Server-Sent Events endpoint for progress updates
app.get('/api/runTest/progress/:sessionId', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sessionId = req.params.sessionId;
    
    // Store this response object for sending progress updates
    if (!global.progressClients) {
        global.progressClients = {};
    }
    global.progressClients[sessionId] = res;
    
    // Cleanup on disconnect
    req.on('close', () => {
        delete global.progressClients[sessionId];
    });
});

// Helper function to send progress updates
function sendProgress(sessionId, message, step, totalSteps) {
    if (global.progressClients && global.progressClients[sessionId]) {
        const data = JSON.stringify({ message, step, totalSteps });
        global.progressClients[sessionId].write(`data: ${data}\n\n`);
    }
    console.log(`[${sessionId}] ${message}`);
}

// Updated API endpoint with session support
app.post('/api/runTestWithProgress', async (req, res) => {
    const sessionId = Date.now().toString();
    
    try {
        const { specialty, customTerms, zipCode } = req.body;
        
        sendProgress(sessionId, 'Starting test...', 0, 10);
        
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
        
        sendProgress(sessionId, 'Configuration validated', 1, 10);
        
        // Perform the actual search with progress tracking
        const result = await performRealSearch(testConfig, zipCode, sessionId);
        
        sendProgress(sessionId, 'Test complete!', 10, 10);
        
        // Cleanup
        if (global.progressClients && global.progressClients[sessionId]) {
            global.progressClients[sessionId].end();
            delete global.progressClients[sessionId];
        }
        
        res.json({
            success: true,
            sessionId: sessionId,
            specialty: testConfig.name,
            description: testConfig.description,
            zipCode: zipCode || '',
            timestamp: new Date().toISOString(),
            results: result
        });
        
    } catch (error) {
        console.error('Error running test:', error);
        
        if (global.progressClients && global.progressClients[sessionId]) {
            sendProgress(sessionId, `Error: ${error.message}`, -1, 10);
            global.progressClients[sessionId].end();
            delete global.progressClients[sessionId];
        }
        
        res.status(500).json({ 
            error: 'Failed to run test: ' + error.message 
        });
    }
});

// Function to perform real search using Puppeteer
async function performRealSearch(config, zipCode = '', sessionId = null) {
    let browser = null;
    
    try {
        sendProgress(sessionId, 'Launching headless browser...', 2, 10);
        
        // Launch browser with production-ready configuration
        const launchOptions = {
            headless: chromium.headless,
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath()
        };

        console.log('Launching browser with Chromium for serverless...');
        browser = await puppeteer.launch(launchOptions);
        
        sendProgress(sessionId, 'Browser launched successfully', 3, 10);
        
        const page = await browser.newPage();
        
        // Set longer timeout for navigation (60 seconds)
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(60000);
        
        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Navigate to the Find a Doctor page with retry logic
        sendProgress(sessionId, 'Navigating to UNC Health Find a Doctor...', 4, 10);
        console.log('Navigating to UNC Health Find a Doctor...');
        
        let navigationSuccess = false;
        let lastError = null;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                sendProgress(sessionId, `Loading page (attempt ${attempt}/3)...`, 4, 10);
                console.log(`Navigation attempt ${attempt}/3...`);
                await page.goto('https://www.unchealth.org/care-services/doctors', {
                    waitUntil: 'domcontentloaded', // Changed from networkidle2 for faster load
                    timeout: 60000
                });
                navigationSuccess = true;
                console.log('Navigation successful!');
                sendProgress(sessionId, 'Page loaded successfully!', 5, 10);
                break;
            } catch (error) {
                lastError = error;
                console.log(`Attempt ${attempt} failed:`, error.message);
                if (attempt < 3) {
                    console.log('Retrying in 2 seconds...');
                    await page.waitForTimeout(2000);
                }
            }
        }
        
        if (!navigationSuccess) {
            throw new Error(`Failed to navigate after 3 attempts: ${lastError.message}`);
        }
        
        // Wait for page to load
        await page.waitForTimeout(5000);
        
        // Try to find and fill in the specialty search field
        sendProgress(sessionId, 'Looking for search form...', 5, 10);
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
        
        // Type the specialty - use page.evaluate for clicking to avoid errors
        const searchTerm = config.name;
        sendProgress(sessionId, `Entering specialty: ${searchTerm}`, 6, 10);
        console.log(`Typing specialty: ${searchTerm}`);
        
        // Focus the input field using evaluate instead of click
        await page.evaluate(input => input.focus(), specialtyInput);
        await page.keyboard.type(searchTerm, { delay: 100 });
        await page.waitForTimeout(1000);
        
        // Fill in ZIP code if provided
        if (zipCode) {
            sendProgress(sessionId, `Entering ZIP code: ${zipCode}`, 6, 10);
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
                // Focus using evaluate instead of click
                await page.evaluate(input => input.focus(), zipInput);
                await page.keyboard.type(zipCode, { delay: 100 });
                await page.waitForTimeout(1000);
            }
        }
        
        // Try to find and click the search button
        sendProgress(sessionId, 'Submitting search...', 7, 10);
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
            // Use page.evaluate to click to avoid "not clickable" error
            await page.evaluate(btn => btn.click(), searchButton);
            console.log('Clicked search button, waiting for results...');
            sendProgress(sessionId, 'Waiting for search results...', 7, 10);
            await page.waitForTimeout(5000); // Wait for results to load
        } else {
            // Try pressing Enter
            console.log('No search button found, pressing Enter...');
            await page.keyboard.press('Enter');
            sendProgress(sessionId, 'Waiting for search results...', 7, 10);
            await page.waitForTimeout(5000);
        }
        
        // Collect providers from multiple pages (limit to 2 pages)
        let allProviders = [];
        const maxPages = 2;
        
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            sendProgress(sessionId, `Extracting providers from page ${pageNum}...`, 7 + pageNum, 10);
            console.log(`Extracting providers from page ${pageNum}...`);
            
            // Extract provider results from current page
            const providers = await page.evaluate(() => {
                const results = [];
                
                // Try to find provider cards - these selectors may need adjustment
                const providerElements = document.querySelectorAll('[class*="provider"], [class*="doctor"], [class*="physician"], [data-testid*="provider"]');
                
                console.log(`Found ${providerElements.length} potential provider elements`);
                
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
            
            console.log(`Found ${providers.length} providers on page ${pageNum}`);
            allProviders = allProviders.concat(providers);
            
            // If this is not the last page, try to navigate to next page
            if (pageNum < maxPages) {
                console.log(`Looking for "Next" button to go to page ${pageNum + 1}...`);
                
                // Try to find and click the next/pagination button
                const nextButtonSelectors = [
                    'button:has-text("Next")',
                    'a:has-text("Next")',
                    'button[aria-label*="next" i]',
                    'a[aria-label*="next" i]',
                    '.pagination button:last-child',
                    '[class*="next"]',
                    '[class*="pagination"] button:not([disabled]):last-child'
                ];
                
                let nextButton = null;
                for (const selector of nextButtonSelectors) {
                    try {
                        nextButton = await page.$(selector);
                        if (nextButton) {
                            // Check if button is disabled
                            const isDisabled = await page.evaluate(btn => {
                                return btn.disabled || btn.classList.contains('disabled') || 
                                       btn.getAttribute('aria-disabled') === 'true';
                            }, nextButton);
                            
                            if (!isDisabled) {
                                console.log(`Found next button with selector: ${selector}`);
                                break;
                            } else {
                                nextButton = null; // Button is disabled, no more pages
                            }
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (nextButton) {
                    sendProgress(sessionId, `Navigating to page ${pageNum + 1}...`, 7 + pageNum, 10);
                    console.log(`Clicking next button to go to page ${pageNum + 1}...`);
                    // Use page.evaluate to avoid click errors
                    await page.evaluate(btn => btn.click(), nextButton);
                    await page.waitForTimeout(3000); // Wait for next page to load
                } else {
                    console.log('No more pages available or next button not found');
                    break; // Exit loop if no next button found
                }
            }
        }
        
        console.log(`Total providers found across ${Math.min(maxPages, pageNum)} pages: ${allProviders.length}`);
        sendProgress(sessionId, `Found ${allProviders.length} providers total. Analyzing results...`, 9, 10);
        
        // If no providers found, return helpful error
        if (allProviders.length === 0) {
            console.log('WARNING: No providers found. The page structure may have changed.');
            console.log('Taking screenshot for debugging...');
            await page.screenshot({ path: 'debug-no-results.png', fullPage: false });
            
            // Return a helpful message instead of empty results
            return {
                total: 0,
                relevant: 0,
                irrelevant: 0,
                accuracy: 0,
                providers: [],
                warning: 'No providers found. This could mean: (1) The search returned no results, (2) The page structure has changed, or (3) The page is still loading. Check debug-no-results.png for details.'
            };
        }
        
        // Analyze results for relevancy
        const analysisResult = analyzeProviders(allProviders, config);
        
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
        providers: analyzedProviders,
        pagesAnalyzed: Math.ceil(total / 10) || 1 // Estimate pages analyzed
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
