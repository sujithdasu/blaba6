
const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

async function scrapeAsura({ url, title }) {
  console.log(`Starting scrape for AsuraScans: ${url}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for images to load
    await page.waitForSelector('img', { timeout: 10000 });
    
    // Get all manga page images - AsuraScans typically uses specific selectors
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => img.src).filter(src => 
        src && (src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) &&
        !src.includes('logo') && !src.includes('banner')
      )
    );
    
    if (images.length === 0) {
      console.log('No images found on the page');
      return { success: false, count: 0 };
    }
    
    // Create download directory
    const downloadDir = path.join(process.cwd(), 'downloads', title || 'asura-manga');
    await fs.ensureDir(downloadDir);
    
    let downloadCount = 0;
    
    for (let i = 0; i < images.length; i++) {
      try {
        const imageUrl = images[i];
        const response = await page.goto(imageUrl);
        
        if (response && response.ok()) {
          const buffer = await response.body();
          const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
          const filename = `page-${String(i + 1).padStart(3, '0')}${ext}`;
          
          await fs.writeFile(path.join(downloadDir, filename), buffer);
          downloadCount++;
          console.log(`Downloaded: ${filename}`);
        }
      } catch (error) {
        console.error(`Error downloading image ${i + 1}:`, error.message);
      }
    }
    
    await browser.close();
    console.log(`Download completed: ${downloadCount} images`);
    
    return { success: true, count: downloadCount };
    
  } catch (error) {
    await browser.close();
    console.error('Scraping error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = scrapeAsura;
