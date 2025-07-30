` tags, preserving the original indentation and structure as much as possible.

```typescript
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MangaIframe } from '../components/MangaIframe';
import { DownloadForm } from '../components/DownloadForm';

interface Site {
  id: string;
  name: string;
  url: string;
  faviconUrl: string;
  isAdult?: boolean;
}

const MANGA_SITES: Site[] = [
  {
    id: 'colamanga',
    name: 'ColaManga',
    url: 'https://www.colamanga.com',
    faviconUrl: 'https://www.colamanga.com/favicon.ico',
    isAdult: false
  },
  {
    id: 'asurascans',
    name: 'AsuraScans',
    url: 'https://asuracomic.net',
    faviconUrl: 'https://asuracomic.net/favicon.ico',
    isAdult: false
  },
  {
    id: 'nhentai',
    name: 'NHentai',
    url: 'https://nhentai.net',
    faviconUrl: 'https://nhentai.net/favicon.ico',
    isAdult: true
  },
  {
    id: 'hentai2read',
    name: 'Hentai2Read',
    url: 'https://hentai2read.com',
    faviconUrl: 'https://hentai2read.com/favicon.ico',
    isAdult: true
  },
  {
    id: 'hitomi',
    name: 'Hitomi.la',
    url: 'https://hitomi.la',
    faviconUrl: 'https://hitomi.la/favicon.ico',
    isAdult: true
  },
  {
    id: 'erosscans',
    name: 'ErosScans',
    url: 'https://erosscans.com',
    faviconUrl: '/favicon.ico', // Fallback to generic
    isAdult: true
  }
];

const Index = () => {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('https://www.colamanga.com');
  const [isAdultMode, setIsAdultMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  const handleSiteSelect = (siteId: string, url: string) => {
    setSelectedSite(siteId);
    setCurrentUrl(url);
  };

  const getCurrentUrl = () => {
    try {
      if (iframeRef && iframeRef.contentWindow) {
        return iframeRef.contentWindow.location.href;
      }
    } catch (error) {
      // CORS restriction, fall back to current URL state
      console.log('Cannot access iframe URL due to CORS policy');
    }
    return currentUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-manga-bg via-manga-bg to-manga-surface flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} flex-shrink-0 transition-all duration-300`}>
        <Sidebar
          onSiteSelect={handleSiteSelect}
          isAdultMode={isAdultMode}
          setIsAdultMode={setIsAdultMode}
          selectedSite={selectedSite}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Browser */}
        <div className="flex-1">
          <MangaIframe
            url={currentUrl}
            onUrlChange={setCurrentUrl}
          />
        </div>

        {/* Download Panel */}
        <div className="w-96 flex-shrink-0">
          <DownloadForm
            selectedSite={selectedSite}
            selectedUrl={currentUrl}
            getCurrentUrl={getCurrentUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;