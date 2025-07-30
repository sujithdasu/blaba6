import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MangaIframe } from "@/components/MangaIframe";
import { DownloadForm } from "@/components/DownloadForm";
import { ToggleSwitch } from "@/components/ToggleSwitch";

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
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(true);
  const [adultMode, setAdultMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [iframeRef, setIframeRef] = useState<any>(null);

  const handleSiteSelect = (siteId: string, url: string) => {
    setSelectedSite(siteId);
    setSelectedUrl(url);
    setCurrentUrl(url);
  };

  const handleUrlChange = (url: string) => {
    setCurrentUrl(url);
    // Auto-detect site from URL
    const detectedSite = MANGA_SITES.find(site => 
      url.toLowerCase().includes(site.url.replace('https://', '').replace('http://', ''))
    );
    if (detectedSite) {
      setSelectedSite(detectedSite.id);
    }
  };

  const getCurrentUrl = () => {
    // Return the most current URL from the iframe
    return currentUrl || selectedUrl || '';
  };

  const selectedSiteName = MANGA_SITES.find(site => site.id === selectedSite)?.name || null;

  return (
    <div className="h-screen bg-manga-bg flex">
      {/* Sidebar */}
      <Sidebar
        sites={MANGA_SITES}
        selectedSite={selectedSite}
        onSiteSelect={handleSiteSelect}
        isAdultMode={adultMode}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        {/* Content Area */}
        <div className="flex-1 flex h-full">
          {/* Main Panel - Iframe */}
          <div className="flex-1 h-full p-6">
            <MangaIframe
              selectedSite={selectedSiteName}
              selectedUrl={currentUrl || selectedUrl}
              previewMode={previewMode}
              onTogglePreview={() => setPreviewMode(!previewMode)}
              onUrlChange={handleUrlChange}
            />
          </div>

          {/* Right Panel - Download Form */}
          <div className="w-96 bg-manga-surface border-l border-manga-border p-6 space-y-6">
            <div className="mb-6">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Manga Downloader
              </h1>
              <p className="text-manga-text-muted text-sm">
                Browse and download manga content
              </p>
            </div>
            
            <ToggleSwitch
              adultMode={adultMode}
              previewMode={previewMode}
              onAdultModeChange={setAdultMode}
              onPreviewModeChange={setPreviewMode}
            />
            
            <DownloadForm 
              selectedSite={selectedSiteName} 
              selectedUrl={currentUrl || selectedUrl}
              getCurrentUrl={getCurrentUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MangaIframe from '@/components/MangaIframe';
import DownloadForm from '@/components/DownloadForm';

const Index = () => {
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [isAdultMode, setIsAdultMode] = useState(false);

  const handleSiteSelect = (url: string) => {
    setCurrentUrl(url);
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        onSiteSelect={handleSiteSelect}
        isAdultMode={isAdultMode}
        setIsAdultMode={setIsAdultMode}
      />
      <div className="flex-1 flex flex-col">
        <MangaIframe url={currentUrl} onUrlChange={setCurrentUrl} />
        <DownloadForm currentUrl={currentUrl} />
      </div>
    </div>
  );
};

export default Index;
