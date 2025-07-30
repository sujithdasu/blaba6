# Manga Downloader Browser App

A comprehensive manga downloader application with real browser simulation capabilities.

## Features

### 🌐 Real Browser Simulation
- Complete browser navigation (back, forward, home, refresh)
- Smart URL completion and search functionality
- Browser history tracking with dropdown menu
- Bookmark system with star icons and management
- Security indicators (HTTPS/HTTP) with shield icons
- Zoom controls (50%-200%) with visual feedback
- Developer tools panel with page information
- Enhanced iframe sandbox permissions for full functionality

### 📚 Supported Manga Sites
- **ColaManga** - General manga site
- **AsuraScans** - Popular manga scanlation site
- **NHentai** - Adult content (18+)
- **Hentai2Read** - Adult content (18+)
- **Hitomi.la** - Adult content (18+)
- **ErosScans** - Adult content (18+)

### 🔧 Download Features
- Auto-detection of manga sites from URLs
- Smart paste functionality from clipboard
- Current URL capture from browser simulation
- Chapter range selection (for supported sites)
- Real-time download status and progress
- Automatic file organization and naming

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Usage

### Development Mode
Run both the client and server in development mode:
```bash
npm run dev
```

This will start:
- Frontend (React/Vite) on `http://localhost:5173`
- Backend (Express) on `http://localhost:3001`

### Production Mode
1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

## How to Use

### 1. Browse Manga Sites
- Click on any supported site in the sidebar
- Use the browser simulation to navigate to your desired manga chapter
- The browser includes all standard features: navigation, bookmarks, history, zoom

### 2. Download Manga
- Navigate to the specific manga chapter you want to download
- In the Download Manager panel, click the "Link" button to capture the current URL
- Alternatively, use the "Clipboard" button to paste a URL
- Click "Download" to start the download process
- Files will be saved to the `downloads/` folder

### 3. Site-Specific Features
- **ColaManga**: Supports chapter range downloads (start/end chapters)
- **AsuraScans**: Single chapter downloads with high-quality images
- **Adult Sites**: Require adult mode to be enabled in settings

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── pages/             # Application pages
│   └── lib/               # Utilities and helpers
├── scrapers/              # Backend scraper modules
│   ├── erosScans.js       # ErosScans scraper
│   ├── asura.js           # AsuraScans scraper
│   └── [other sites].js   # Additional scrapers
├── server/                # Backend Express server
│   └── index.js           # Main server file
└── downloads/             # Downloaded manga files
```

## API Endpoints

### POST /api/scrape
Download manga from a supported site.

**Request Body:**
```json
{
  "url": "https://example.com/manga/chapter",
  "site": "asurascans",
  "chapterStart": 1,
  "chapterEnd": 10
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Download completed",
  "result": { "count": 25 }
}
```

### GET /api/health
Check server status and available scrapers.

## Adding New Scrapers

To add support for a new manga site:

1. Create a new scraper file in `scrapers/[sitename].js`
2. Follow the existing scraper pattern:
   ```javascript
   async function scrapeSite({ url, title }) {
     // Implementation
     return { success: true, count: imageCount };
   }
   module.exports = scrapeSite;
   ```
3. Add the scraper to `server/index.js` in the scrapers object
4. Add site detection in `src/components/DownloadForm.tsx`
5. Add the site to the sites list in `src/pages/Index.tsx`

## Browser Limitations

Due to browser security (CORS policy), the URL bar in the browser simulation may not update for cross-origin navigation within iframes. This is a browser security feature and cannot be bypassed in web applications.

For full URL tracking capabilities, consider building a native desktop application using Electron or Tauri.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your scraper module
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes only. Please respect the terms of service of the manga sites you access.

## Disclaimer

This tool is intended for personal use only. Users are responsible for complying with the terms of service of the websites they access and applicable copyright laws.