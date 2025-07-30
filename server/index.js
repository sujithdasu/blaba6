// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import scrapers
const scrapeErosScans = require('../scrapers/erosScans');
const scrapeAsura = require('../scrapers/asura');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Site scraper mapping
const scrapers = {
  'erosscans': scrapeErosScans,
  'asurascans': scrapeAsura,
  // Add other scrapers as you provide them
  'colamanga': null, // Placeholder for colamanga.js
  'nhentai': null,   // Placeholder for nhentai.js
  'hentai2read': null, // Placeholder for hentai2read.js
  'hitomi': null     // Placeholder for hitomi.js
};

// API endpoint for scraping
app.post('/api/scrape', async (req, res) => {
  try {
    const { url, site, chapterStart, chapterEnd } = req.body;

    if (!url || !site) {
      return res.status(400).json({
        status: 'error',
        message: 'URL and site are required'
      });
    }

    const scraper = scrapers[site.toLowerCase()];
    
    if (!scraper) {
      return res.status(400).json({
        status: 'error',
        message: `Scraper for ${site} is not available yet`
      });
    }

    console.log(`🚀 Starting download for ${site}: ${url}`);

    // Extract title from URL for folder naming
    const urlParts = new URL(url);
    const pathParts = urlParts.pathname.split('/').filter(Boolean);
    const title = pathParts[pathParts.length - 1] || `${site}_manga`;

    // Prepare scraper options
    const options = {
      url,
      title: title.replace(/[^a-zA-Z0-9_-]/g, '_') // Sanitize filename
    };

    // Add chapter range if provided
    if (chapterStart) {
      options.chapterStart = chapterStart;
      if (chapterEnd) {
        options.chapterEnd = chapterEnd;
      }
    }

    // Run the scraper
    const result = await scraper(options);

    res.json({
      status: 'success',
      message: `Download completed for ${title}`,
      result
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    availableScrapers: Object.keys(scrapers).filter(key => scrapers[key] !== null)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Manga downloader server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/scrape`);
  console.log(`🔍 Available scrapers: ${Object.keys(scrapers).filter(key => scrapers[key] !== null).join(', ')}`);
});

module.exports = app;