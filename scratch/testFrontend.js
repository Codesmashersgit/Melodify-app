const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5174');
    
    // Wait a few seconds for network requests to finish
    await new Promise(r => setTimeout(r, 6000));
    
    // Print console logs to see if there are any errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.screenshot({ path: 'E:/Melodify/scratch/screenshot.png' });
    
    // Also get the HTML content to see if artists are rendered
    const html = await page.content();
    if (html.includes('Shreya Ghoshal') || html.includes('Arijit Singh')) {
        console.log('ARTISTS RENDERED!');
    } else {
        console.log('ARTISTS NOT RENDERED');
    }
    
    await browser.close();
})();
