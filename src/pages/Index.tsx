
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  Download, 
  Link, 
  Clipboard, 
  Shield, 
  Eye, 
  EyeOff,
  Globe,
  RefreshCw
} from 'lucide-react';

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
    faviconUrl: '/favicon.ico',
    isAdult: true
  }
];

const Index = () => {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('https://www.colamanga.com');
  const [isAdultMode, setIsAdultMode] = useState(false);
  const [browserEnabled, setBrowserEnabled] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site.id);
    setCurrentUrl(site.url);
  };

  const handleCaptureUrl = () => {
    setDownloadUrl(currentUrl);
    toast({
      title: "URL Captured",
      description: "Current browser URL has been captured for download.",
    });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.startsWith('http')) {
        setDownloadUrl(clipboardText);
        toast({
          title: "URL Pasted",         
          description: "URL has been pasted from clipboard.",
        });
      } else {
        toast({
          title: "Invalid URL",
          description: "Clipboard doesn't contain a valid URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Clipboard Error",
        description: "Unable to access clipboard. Please paste manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to download.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSite) {
      toast({
        title: "Site Required",
        description: "Please select a manga site first.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site: selectedSite,
          url: downloadUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Download Started",
        description: "Manga download has been initiated.",
      });

      setDownloadUrl('');

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to start download. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredSites = MANGA_SITES.filter(site => 
    isAdultMode || !site.isAdult
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Sidebar - Site Selection */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Manga Sites</h2>
          
          {/* Adult Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-300" />
              <Label className="text-white font-medium">Adult Mode</Label>
            </div>
            <Switch
              checked={isAdultMode}
              onCheckedChange={setIsAdultMode}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {filteredSites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSiteSelect(site)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border ${
                  selectedSite === site.id 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <div className="w-8 h-8 rounded overflow-hidden bg-gray-600 flex-shrink-0">
                  <img
                    src={site.faviconUrl}
                    alt={site.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23666" rx="4"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${site.name.slice(0, 2).toUpperCase()}</text></svg>`;
                    }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{site.name}</div>
                  {site.isAdult && (
                    <Badge variant="destructive" className="text-xs mt-1">18+</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center - Browser */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-400" />
              <Label className="text-white font-medium">Browser</Label>
            </div>
            <Switch
              checked={browserEnabled}
              onCheckedChange={setBrowserEnabled}
            />
            {selectedSite && (
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {MANGA_SITES.find(s => s.id === selectedSite)?.name}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 p-4">
          {browserEnabled ? (
            <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-gray-600">
              <iframe
                src={currentUrl}
                className="w-full h-full border-0"
                title="Manga Site Browser"
                sandbox="allow-same-origin allow-scripts allow-forms allow-navigation"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Globe className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Browser Disabled</p>
                <p className="text-sm">Enable browser to view manga sites</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Controls */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Download Manager</h3>
          
          {/* Browser Toggle */}
          <Card className="mb-4 bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {browserEnabled ? (
                    <Eye className="h-4 w-4 text-green-400" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <Label className="text-white font-medium">Browser View</Label>
                </div>
                <Switch
                  checked={browserEnabled}
                  onCheckedChange={setBrowserEnabled}
                />
              </div>
            </Card>

          {/* Adult/Regular Toggle */}
          <Card className="mb-4 bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-400" />
                  <Label className="text-white font-medium">
                    {isAdultMode ? 'Adult Content' : 'Regular Content'}
                  </Label>
                </div>
                <Switch
                  checked={isAdultMode}
                  onCheckedChange={setIsAdultMode}
                />
              </div>
              {isAdultMode && (
                <p className="text-xs text-red-400 mt-2">
                  Adult content sites are now visible
                </p>
              )}
            </CardContent>
          </Card>

          <Separator className="my-4 bg-gray-600" />

          {/* Download URL */}
          <div className="space-y-4">
            <div>
              <Label className="text-white font-medium mb-2 block">Download URL</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="url"
                  placeholder="Enter manga URL..."
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="flex-1 bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                  disabled={isDownloading}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCaptureUrl}
                  disabled={isDownloading || !browserEnabled}
                  title="Capture current browser URL"
                  className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                >
                  <Link className="h-4 w-4 mr-1" />
                  Capture
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasteFromClipboard}
                  disabled={isDownloading}
                  title="Paste from clipboard"
                  className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                >
                  <Clipboard className="h-4 w-4 mr-1" />
                  Paste
                </Button>
              </div>
            </div>

            {/* Download Button */}
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading || !downloadUrl || !selectedSite}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isDownloading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>

            {!selectedSite && (
              <p className="text-sm text-gray-400 text-center">
                Please select a manga site first
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
