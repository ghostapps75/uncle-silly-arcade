const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Listen to console and page errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

    console.log("Navigating to local dev server...");
    await page.goto('http://localhost:57858');
    
    console.log("Waiting for game to load...");
    await page.waitForTimeout(2000); // 2 seconds

    console.log("Clicking Casey's Daily Debrief...");
    // The button has text "Casey's Daily Debrief"
    try {
        await page.click("text=Casey's Daily Debrief");
        console.log("Clicked! Waiting for fetch...");
        await page.waitForTimeout(5000); // Wait for API response
    } catch (e) {
        console.log("Could not find button", e);
    }
    
    await browser.close();
})();
