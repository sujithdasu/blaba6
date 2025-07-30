import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Bookmark, 
  History, 
  ZoomIn, 
  ZoomOut, 
  MoreVertical,
  ExternalLink,
  Copy
} from 'lucide-react';

interface MangaIframeProps {
  url: string;
  onUrlChange: (url: string) => void;
}

interface HistoryItem {
  url: string;
  title: string;
  timestamp: Date;
}

interface BookmarkItem {
  url: string;
  title: string;
  favicon?: string;
}

export function MangaIframe({ 
  url, 
  onUrlChange 
}: MangaIframeProps) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [inputUrl, setInputUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load bookmarks and history from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('mangaBrowserBookmarks');
    const savedHistory = localStorage.getItem('mangaBrowserHistory');

    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(parsedHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('mangaBrowserBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('mangaBrowserHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    setCurrentUrl(url);
    setInputUrl(url);
  }, [url]);

  const addToHistory = (url: string, title: string = '') => {
    const newItem: HistoryItem = {
      url,
      title: title || getDomainFromUrl(url),
      timestamp: new Date()
    };

    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item.url !== url);
      // Add to beginning and limit to 50 items
      return [newItem, ...filtered].slice(0, 50);
    });
  };

  const addBookmark = () => {
    const title = getDomainFromUrl(currentUrl);
    const newBookmark: BookmarkItem = {
      url: currentUrl,
      title,
      favicon: `${new URL(currentUrl).origin}/favicon.ico`
    };

    setBookmarks(prev => {
      // Check if bookmark already exists
      if (prev.some(bookmark => bookmark.url === currentUrl)) {
        toast({
          title: "Already Bookmarked",
          description: "This page is already in your bookmarks.",
        });
        return prev;
      }

      toast({
        title: "Bookmark Added",
        description: `Added ${title} to bookmarks.`,
      });

      return [newBookmark, ...prev].slice(0, 20); // Limit to 20 bookmarks
    });
  };

  const removeBookmark = (url: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.url !== url));
    toast({
      title: "Bookmark Removed",
      description: "Bookmark has been removed.",
    });
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl) {
      let processedUrl = inputUrl;

      // Add protocol if missing
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }

      setCurrentUrl(processedUrl);
      setIsLoading(true);
      onUrlChange(processedUrl);
      addToHistory(processedUrl);
    }
  };

  const handleNavigation = (action: 'back' | 'forward' | 'reload' | 'home') => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      switch (action) {
        case 'back':
          iframe.contentWindow.history.back();
          break;
        case 'forward':
          iframe.contentWindow.history.forward();
          break;
        case 'reload':
          iframe.contentWindow.location.reload();
          break;
        case 'home':
          const homeUrl = getHomeUrl(currentUrl);
          setCurrentUrl(homeUrl);
          setInputUrl(homeUrl);
          onUrlChange(homeUrl);
          addToHistory(homeUrl);
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: "Unable to perform navigation action.",
        variant: "destructive",
      });
    }
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    let newZoom = zoom;

    switch (direction) {
      case 'in':
        newZoom = Math.min(zoom + 25, 200);
        break;
      case 'out':
        newZoom = Math.max(zoom - 25, 50);
        break;
      case 'reset':
        newZoom = 100;
        break;
    }

    setZoom(newZoom);
  };

  const copyCurrentUrl = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        title: "URL Copied",
        description: "Current URL has been copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Unable to copy URL to clipboard.",
        variant: "destructive",
      });
    });
  };

  const openInNewTab = () => {
    window.open(currentUrl, '_blank');
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getHomeUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return url;
    }
  };

  const isBookmarked = bookmarks.some(bookmark => bookmark.url === currentUrl);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Browser Controls */}
      <Card className="mb-4">
        <CardContent className="p-3">
          {/* Navigation Bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation('back')}
                disabled={!canGoBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation('forward')}
                disabled={!canGoForward}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation('reload')}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation('home')}
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>

            {/* URL Bar */}
            <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-2">
              <Input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter URL..."
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Go
              </Button>
            </form>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={addBookmark}
                disabled={isBookmarked}
                title={isBookmarked ? "Already bookmarked" : "Add bookmark"}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 font-medium">Recent History</div>
                  <DropdownMenuSeparator />
                  {history.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No browsing history yet
                    </div>
                  ) : (
                    history.slice(0, 10).map((item, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => {
                          setCurrentUrl(item.url);
                          setInputUrl(item.url);
                          onUrlChange(item.url);
                        }}
                        className="flex flex-col items-start p-3 cursor-pointer"
                      >
                        <div className="font-medium truncate w-full">{item.title}</div>
                        <div className="text-xs text-muted-foreground truncate w-full">{getDomainFromUrl(item.url)}</div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 font-medium">Bookmarks</div>
                  <DropdownMenuSeparator />
                  {bookmarks.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No bookmarks yet
                    </div>
                  ) : (
                    bookmarks.map((bookmark, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => {
                          setCurrentUrl(bookmark.url);
                          setInputUrl(bookmark.url);
                          onUrlChange(bookmark.url);
                        }}
                        className="flex flex-col items-start p-3 cursor-pointer"
                      >
                        <div className="font-medium truncate w-full">{bookmark.title}</div>
                        <div className="text-xs text-muted-foreground truncate w-full">{getDomainFromUrl(bookmark.url)}</div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={copyCurrentUrl}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openInNewTab}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleZoom('in')}>
                    <ZoomIn className="mr-2 h-4 w-4" />
                    Zoom In ({zoom}%)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleZoom('out')}>
                    <ZoomOut className="mr-2 h-4 w-4" />
                    Zoom Out ({zoom}%)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleZoom('reset')}>
                    Reset Zoom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getDomainFromUrl(currentUrl)}
              </Badge>
              {isLoading && (
                <Badge variant="outline" className="text-xs">
                  Loading...
                </Badge>
              )}
            </div>
            <div>
              Zoom: {zoom}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browser Frame */}
      <div 
        className="flex-1 relative bg-white rounded-lg overflow-hidden border"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
      >
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          onLoad={() => {
            setIsLoading(false);
            // Try to detect navigation state (limited due to CORS)
            try {
              const iframe = iframeRef.current;
              if (iframe?.contentWindow) {
                setCanGoBack(iframe.contentWindow.history.length > 1);
                setCanGoForward(false); // Cannot reliably detect this
              }
            } catch (error) {
              // Ignore CORS errors
            }
          }}
          onError={() => {
            setIsLoading(false);
            toast({
              title: "Failed to Load",
              description: "Unable to load the requested page.",
              variant: "destructive",
            });
          }}
          title="Manga Site Browser"
          sandbox="allow-same-origin allow-scripts allow-forms allow-navigation"
        />
      </div>
    </div>
  );
}