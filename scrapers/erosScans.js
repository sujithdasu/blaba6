
const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

async function scrapeErosScans({ url, title = 'eros_manga' }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/110 Safari/537.36'
  });
  const page = await context.newPage();
  
  page.on('popup', popup => popup.close()); // Prevent mini-tabs
  
  console.log(`🌐 Opening: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (err) {
    console.error(`❌ Failed to load page: ${err.message}`);
    await browser.close();
    return { success: false, error: err.message };
  }

  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(1500);

  const imgLinks = await page.$$eval('#readerarea img.ts-main-image', imgs =>
    imgs.map(img => img.src)
  );

  console.log(`🖼️ Found ${imgLinks.length} images`);

  const folder = path.join(__dirname, '..', 'downloads', title.replace(/\s+/g, '_'));
  await fs.ensureDir(folder);

  let downloadCount = 0;
  for (let i = 0; i < imgLinks.length; i++) {
    try {
      const imgUrl = imgLinks[i];
      const filename = `image_${String(i + 1).padStart(3, '0')}.jpg`;
      const filepath = path.join(folder, filename);
      
      const response = await page.goto(imgUrl);
      if (response) {
        const buffer = await response.body();
        await fs.writeFile(filepath, buffer);
        downloadCount++;
        console.log(`📥 Downloaded: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to download image ${i + 1}:`, error.message);
    }
  }

  await browser.close();
  console.log(`✅ Download complete! ${downloadCount} images saved to ${folder}`);
  
  return { success: true, count: downloadCount };
}

module.exports = scrapeErosScans;
