import { useState, useRef, useEffect } from "react";
import { RefreshCw, ExternalLink, Eye, EyeOff, Home, Star, Settings, Shield, Download, Bookmark, History, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MangaIframeProps {
  selectedSite: string | null;
  selectedUrl: string | null;
  previewMode: boolean;
  onTogglePreview: () => void;
  onUrlChange: (url: string) => void;
}

interface HistoryItem {
  url: string;
  title: string;
  timestamp: Date;
}

interface Bookmark {
  url: string;
  title: string;
  favicon?: string;
}

export function MangaIframe({ 
  selectedSite, 
  selectedUrl, 
  previewMode, 
  onTogglePreview,
  onUrlChange
}: MangaIframeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(selectedUrl || "");
  const [inputUrl, setInputUrl] = useState(selectedUrl || "");
  const [isSecure, setIsSecure] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (selectedUrl) {
      setCurrentUrl(selectedUrl);
      setInputUrl(selectedUrl);
      setIsSecure(selectedUrl.startsWith('https://'));
    }
  }, [selectedUrl]);

  useEffect(() => {
    const checkIframeUrl = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const iframeUrl = iframeRef.current.contentWindow.location.href;
          const iframeTitle = iframeRef.current.contentDocument?.title || selectedSite || "Untitled";
          
          if (iframeUrl && iframeUrl !== currentUrl && iframeUrl !== 'about:blank') {
            setCurrentUrl(iframeUrl);
            setInputUrl(iframeUrl);
            setPageTitle(iframeTitle);
            setIsSecure(iframeUrl.startsWith('https://'));
            onUrlChange(iframeUrl);
            
            setHistory(prev => {
              const newItem: HistoryItem = {
                url: iframeUrl,
                title: iframeTitle,
                timestamp: new Date()
              };
              return [newItem, ...prev.slice(0, 49)]; 
            });
          }
        } catch (error) {
          
        }
      }
    };

    const interval = setInterval(checkIframeUrl, 1000);
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', checkIframeUrl);
    }

    return () => {
      clearInterval(interval);
      if (iframe) {
        iframe.removeEventListener('load', checkIframeUrl);
      }
    };
  }, [currentUrl, onUrlChange, selectedSite]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      let url = inputUrl.trim();
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.')) {
          url = `https://${url}`;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
      }
      
      setCurrentUrl(url);
      setInputUrl(url);
      setIsSecure(url.startsWith('https://'));
      onUrlChange(url);
      setIsLoading(true);
      setIframeKey(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const iframeUrl = iframeRef.current.contentWindow.location.href;
          const iframeTitle = iframeRef.current.contentDocument?.title || selectedSite || "Untitled";
          
          if (iframeUrl && iframeUrl !== currentUrl && iframeUrl !== 'about:blank') {
            setCurrentUrl(iframeUrl);
            setInputUrl(iframeUrl);
            setPageTitle(iframeTitle);
            setIsSecure(iframeUrl.startsWith('https://'));
            onUrlChange(iframeUrl);
          }
          
          setCanGoBack(iframeRef.current.contentWindow.history.length > 1);
          setCanGoForward(false); 
        } catch (error) {
          
        }
      }
    }, 500);
  };

  const openInNewTab = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank');
    }
  };

  const handleGoBack = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
        setCanGoForward(true);
      } catch (error) {
        console.log('Cannot access iframe history due to CORS policy');
      }
    }
  };

  const handleGoForward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.forward();
      } catch (error) {
        console.log('Cannot access iframe history due to CORS policy');
      }
    }
  };

  const handleGoHome = () => {
    if (selectedUrl) {
      setCurrentUrl(selectedUrl);
      setInputUrl(selectedUrl);
      onUrlChange(selectedUrl);
      setIsLoading(true);
      setIframeKey(prev => prev + 1);
    }
  };

  const addBookmark = () => {
    if (currentUrl && pageTitle) {
      const newBookmark: Bookmark = {
        url: currentUrl,
        title: pageTitle || currentUrl,
        favicon: `${new URL(currentUrl).origin}/favicon.ico`
      };
      
      setBookmarks(prev => {
        if (!prev.find(b => b.url === currentUrl)) {
          return [newBookmark, ...prev];
        }
        return prev;
      });
    }
  };

  const navigateToBookmark = (bookmark: Bookmark) => {
    setCurrentUrl(bookmark.url);
    setInputUrl(bookmark.url);
    onUrlChange(bookmark.url);
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const navigateToHistoryItem = (item: HistoryItem) => {
    setCurrentUrl(item.url);
    setInputUrl(item.url);
    onUrlChange(item.url);
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'reset') {
      setZoomLevel(100);
    } else if (direction === 'in' && zoomLevel < 200) {
      setZoomLevel(prev => prev + 10);
    } else if (direction === 'out' && zoomLevel > 50) {
      setZoomLevel(prev => prev - 10);
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  if (!previewMode) {
    return (
      <div className="h-full flex items-center justify-center bg-manga-bg rounded-lg border border-manga-border">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-manga-surface rounded-2xl flex items-center justify-center border border-manga-border">
            <EyeOff className="w-12 h-12 text-manga-text-muted" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-manga-text mb-2">Preview Disabled</h3>
            <p className="text-manga-text-muted max-w-md">
              Preview mode is turned off. Enable it to browse manga sites directly in the interface.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSite || !currentUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-manga-bg rounded-lg border border-manga-border">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-manga-surface rounded-2xl flex items-center justify-center border border-manga-border">
            <Eye className="w-12 h-12 text-manga-text-muted" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-manga-text mb-2">Select a Site</h3>
            <p className="text-manga-text-muted max-w-md">
              Choose a manga site from the sidebar to start browsing and finding content to download.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-manga-bg rounded-lg border border-manga-border overflow-hidden">
      <div className="flex flex-col gap-2 p-3 bg-manga-surface border-b border-manga-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="manga-ghost"
              size="sm"
              onClick={handleGoBack}
              disabled={isLoading || !canGoBack}
              title="Go Back"
              className="h-8 w-8 p-0"
            >
              ←
            </Button>
            <Button
              variant="manga-ghost"
              size="sm"
              onClick={handleGoForward}
              disabled={isLoading || !canGoForward}
              title="Go Forward"
              className="h-8 w-8 p-0"
            >
              →
            </Button>
            <Button
              variant="manga-ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh"
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="manga-ghost"
              size="sm"
              onClick={handleGoHome}
              disabled={isLoading}
              title="Home"
              className="h-8 w-8 p-0"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="manga-ghost"
              size="sm"
              onClick={addBookmark}
              title="Bookmark this page"
              className="h-8 w-8 p-0"
            >
              <Star className={cn("w-4 h-4", bookmarks.find(b => b.url === currentUrl) && "fill-yellow-400 text-yellow-400")} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="manga-ghost" size="sm" className="h-8 w-8 p-0">
                  <History className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="p-2 font-semibold text-sm">Recent History</div>
                <DropdownMenuSeparator />
                {history.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No history yet</div>
                ) : (
                  history.slice(0, 10).map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => navigateToHistoryItem(item)}
                      className="flex flex-col items-start p-2 cursor-pointer"
                    >
                      <div className="font-medium text-sm truncate w-full">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate w-full">{getDomainFromUrl(item.url)}</div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="manga-ghost" size="sm" className="h-8 w-8 p-0">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="p-2 font-semibold text-sm">Bookmarks</div>
                <DropdownMenuSeparator />
                {bookmarks.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No bookmarks yet</div>
                ) : (
                  bookmarks.map((bookmark, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => navigateToBookmark(bookmark)}
                      className="flex items-center gap-2 p-2 cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{bookmark.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{getDomainFromUrl(bookmark.url)}</div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="manga-ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleZoom('in')}>
                  Zoom In ({zoomLevel}%)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleZoom('out')}>
                  Zoom Out ({zoomLevel}%)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleZoom('reset')}>
                  Reset Zoom
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDevTools(!showDevTools)}>
                  {showDevTools ? 'Hide' : 'Show'} Developer Tools
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openInNewTab}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <form onSubmit={handleUrlSubmit} className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-2 bg-manga-bg border border-manga-border rounded-md flex-1">
            <div className="flex items-center gap-1">
              {isSecure ? (
                <Shield className="w-4 h-4 text-green-500" title="Secure connection" />
              ) : (
                <Shield className="w-4 h-4 text-orange-500" title="Not secure" />
              )}
              <span className="text-xs text-manga-text-muted">
                {getDomainFromUrl(currentUrl)}
              </span>
            </div>
            <Input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Search or enter URL..."
              className="flex-1 border-0 bg-transparent text-manga-text placeholder:text-manga-text-muted focus:ring-0 focus:outline-none p-0 h-auto"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            variant="manga"
            size="sm"
            disabled={isLoading || !inputUrl.trim()}
          >
            Go
          </Button>
        </form>

        {pageTitle && (
          <div className="flex items-center justify-between text-xs text-manga-text-muted">
            <div className="flex items-center gap-2">
              <span className="truncate max-w-md">{pageTitle}</span>
              {isLoading && <Badge variant="secondary" className="text-xs">Loading...</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <span>Zoom: {zoomLevel}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-manga-bg/80 flex items-center justify-center z-10">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="text-manga-text">Loading...</span>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={currentUrl}
            className="w-full h-full border-0"
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left',
              width: `${10000 / zoomLevel}%`,
              height: `${10000 / zoomLevel}%`
            }}
            onLoad={handleIframeLoad}
            title={pageTitle || `${selectedSite || 'Web'} Preview`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads allow-navigation-by-user-activation allow-modals"
          />
        </div>

        {showDevTools && (
          <div className="w-80 bg-manga-surface border-l border-manga-border p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-manga-text mb-2">Developer Tools</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-manga-text-muted">URL:</span>
                    <div className="text-manga-text break-all">{currentUrl}</div>
                  </div>
                  <div>
                    <span className="text-manga-text-muted">Title:</span>
                    <div className="text-manga-text">{pageTitle || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-manga-text-muted">Security:</span>
                    <div className="text-manga-text">{isSecure ? 'HTTPS' : 'HTTP'}</div>
                  </div>
                  <div>
                    <span className="text-manga-text-muted">Zoom:</span>
                    <div className="text-manga-text">{zoomLevel}%</div>
                  </div>
                  <div>
                    <span className="text-manga-text-muted">History:</span>
                    <div className="text-manga-text">{history.length} items</div>
                  </div>
                  <div>
                    <span className="text-manga-text-muted">Bookmarks:</span>
                    <div className="text-manga-text">{bookmarks.length} items</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-manga-text mb-2">Console</h4>
                <div className="bg-manga-bg p-2 rounded text-xs font-mono text-manga-text-muted">
                  Browser simulation active<br/>
                  CORS restrictions may apply<br/>
                  Iframe sandbox enabled
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}