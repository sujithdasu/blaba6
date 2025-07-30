
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import scrapers
const scrapeErosScans = require('../scrapers/erosScans');
const scrapeAsura = require('../scrapers/asura');

// Scrapers mapping
const scrapers = {
  'erosscans': scrapeErosScans,
  'asurascans': scrapeAsura,
  'asura': scrapeAsura
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    scrapers: Object.keys(scrapers),
    timestamp: new Date().toISOString()
  });
});

// Scrape endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    const { url, site, title, chapterStart, chapterEnd } = req.body;
    
    if (!url || !site) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL and site are required' 
      });
    }
    
    const scraper = scrapers[site.toLowerCase()];
    if (!scraper) {
      return res.status(400).json({ 
        success: false, 
        error: `Unsupported site: ${site}` 
      });
    }
    
    console.log(`Starting scrape for ${site}: ${url}`);
    
    const result = await scraper({ 
      url, 
      title: title || `manga-${Date.now()}`,
      chapterStart,
      chapterEnd 
    });
    
    if (result.success) {
      res.json({
        status: 'success',
        message: 'Download completed',
        result: { count: result.count }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: result.error || 'Download failed'
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

const scrapers = {
  'erosscans': scrapeErosScans,
  'asurascans': scrapeAsura,
  // Add other scrapers as you provide them
  'colamanga': null, // Placeholder for colamanga.js
  'nhentai': null,   // Placeholder for nhentai.js
  'hentai2read': null, // Placeholder for hentai2read.js
  'hitomi': null     // Placeholder for hitomi.js
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    availableScrapers: Object.keys(scrapers).filter(key => scrapers[key] !== null)
  });
});

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

    if (result && result.success) {
      res.json({
        status: 'success',
        message: 'Download completed',
        result: { count: result.count || 0 }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Download failed'
      });
    }

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
});
