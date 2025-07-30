import React from "react";
import { useState, useEffect } from "react";
import { Download, Link, Hash, Loader2, CheckCircle, XCircle, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DownloadFormProps {
  selectedSite: string | null;
  selectedUrl: string | null;
  getCurrentUrl?: () => string;
}

type DownloadStatus = 'idle' | 'loading' | 'success' | 'error';

// Site detection function
const detectSiteFromUrl = (url: string): string | null => {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('colamanga.com')) return 'ColaManga';
    if (domain.includes('asuracomic.net') || domain.includes('asurascans.com')) return 'AsuraScans';
    if (domain.includes('nhentai.net')) return 'NHentai';
    if (domain.includes('hentai2read.com')) return 'Hentai2Read';
    if (domain.includes('hitomi.la')) return 'Hitomi';
    if (domain.includes('erosscans.com')) return 'ErosScans';
    
    return null;
  } catch {
    return null;
  }
};

export function DownloadForm({ selectedSite, selectedUrl, getCurrentUrl }: DownloadFormProps) {
  const [url, setUrl] = useState("");
  const [chapterStart, setChapterStart] = useState("");
  const [chapterEnd, setChapterEnd] = useState("");
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  // Auto-detect URL from clipboard on component mount
  React.useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && detectSiteFromUrl(clipboardText)) {
            // Only auto-fill if the URL field is empty and clipboard contains a valid manga URL
            if (!url.trim()) {
              setUrl(clipboardText);
              toast({
                title: "URL Auto-detected",
                description: "Found a manga URL in your clipboard and filled it automatically."
              });
            }
          }
        }
      } catch (error) {
        // Silently fail if clipboard access is denied
        console.log('Clipboard access not available');
      }
    };

    checkClipboard();
  }, []);

  // Handle paste button click
  const handlePasteUrl = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.trim()) {
          setUrl(clipboardText.trim());
          toast({
            title: "URL Pasted",
            description: "URL has been pasted from clipboard."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Clipboard Empty",
            description: "No text found in clipboard."
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Clipboard Access Denied",
          description: "Unable to access clipboard. Please paste manually."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Paste Failed",
        description: "Could not access clipboard. Please paste manually."
      });
    }
  };

  // Handle getting current URL
  const handleGetCurrentUrl = () => {
    const currentUrl = getCurrentUrl ? getCurrentUrl() : selectedUrl;
    if (currentUrl) {
      setUrl(currentUrl);
      toast({
        title: "URL Updated",
        description: "Current webpage URL has been filled in.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "No URL Available",
        description: "No current webpage URL is available.",
      });
    }
  };

  // Detect site from URL or use selected site
  const detectedSite = url ? detectSiteFromUrl(url) : null;
  const activeSite = detectedSite || selectedSite;
  
  // Sites that support chapter range
  const supportsChapterRange = activeSite === 'ColaManga';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "Missing URL",
        description: "Please enter a manga URL to download."
      });
      return;
    }

    // Validate that we can detect the site
    if (!activeSite) {
      toast({
        variant: "destructive",
        title: "Unsupported Site",
        description: "The URL you entered is not from a supported manga site."
      });
      return;
    }
    setStatus('loading');
    setMessage('');

    try {
      const payload: any = { 
        url: url.trim(),
        site: activeSite.toLowerCase() // Send the detected/selected site
      };
      
      if (supportsChapterRange && chapterStart) {
        payload.chapterStart = parseInt(chapterStart);
        if (chapterEnd) {
          payload.chapterEnd = parseInt(chapterEnd);
        }
      }

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setStatus('success');
        setMessage(data.message || 'Download completed successfully!');
        toast({
          title: "Download Started",
          description: `${activeSite} download has been queued successfully.`
        });
        
        // Reset form after success
        setTimeout(() => {
          setUrl("");
          setChapterStart("");
          setChapterEnd("");
          setStatus('idle');
          setMessage("");
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Download failed');
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: data.message || "Something went wrong during the download."
        });
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error - check if backend is running');
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the download service."
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'loading':
        return 'Downloading...';
      case 'success':
        return 'Downloaded!';
      case 'error':
        return 'Try Again';
      default:
        return 'Download';
    }
  };

  return (
    <Card className="bg-manga-surface border-manga-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-manga-text">
          <Download className="w-5 h-5" />
          Download Manga
          {activeSite && (
            <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-md">
              {activeSite}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-manga-text flex items-center gap-2">
              <Link className="w-4 h-4" />
              Manga URL
              {detectedSite && (
                <span className="text-xs text-accent">
                  ({detectedSite} detected)
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/manga/title"
                className="bg-manga-bg border-manga-border text-manga-text placeholder:text-manga-text-muted focus:border-primary focus:ring-primary pr-20"
                disabled={status === 'loading'}
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="manga-ghost"
                  size="sm"
                  onClick={handlePasteUrl}
                  disabled={status === 'loading'}
                  className="h-8 w-8 p-0 rounded-full hover:bg-manga-surface-hover"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="manga-ghost"
                  size="sm"
                  onClick={handleGetCurrentUrl}
                  disabled={status === 'loading'}
                  className="h-8 w-8 p-0 rounded-full hover:bg-manga-surface-hover"
                  title="Get current webpage URL"
                >
                  <Link className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chapter Range (conditional) */}
          {supportsChapterRange && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chapterStart" className="text-manga-text flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Start Chapter
                </Label>
                <Input
                  id="chapterStart"
                  type="number"
                  value={chapterStart}
                  onChange={(e) => setChapterStart(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="bg-manga-bg border-manga-border text-manga-text placeholder:text-manga-text-muted focus:border-primary focus:ring-primary"
                  disabled={status === 'loading'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapterEnd" className="text-manga-text flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  End Chapter
                </Label>
                <Input
                  id="chapterEnd"
                  type="number"
                  value={chapterEnd}
                  onChange={(e) => setChapterEnd(e.target.value)}
                  placeholder="Latest"
                  min={chapterStart || "1"}
                  className="bg-manga-bg border-manga-border text-manga-text placeholder:text-manga-text-muted focus:border-primary focus:ring-primary"
                  disabled={status === 'loading'}
                />
              </div>
            </div>
          )}

          {/* Download Button */}
          <Button
            type="submit"
            disabled={status === 'loading' || !url.trim()}
            variant="manga"
            className="w-full"
          >
            {getStatusIcon()}
            {getButtonText()}
          </Button>

          {/* Status Message */}
          {message && (
            <div className={`text-sm p-3 rounded-lg border ${
              status === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : status === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-manga-surface border-manga-border text-manga-text'
            }`}>
              {message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}