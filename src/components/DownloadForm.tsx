import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  Download, 
  Link, 
  Clipboard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface DownloadFormProps {
  selectedSite: string | null;
  selectedUrl: string;
  getCurrentUrl: () => string;
}

interface DownloadJob {
  id: string;
  site: string;
  url: string;
  startChapter?: number;
  endChapter?: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  downloadedFiles: number;
  totalFiles: number;
  createdAt: Date;
}

export function DownloadForm({ selectedSite, selectedUrl, getCurrentUrl }: DownloadFormProps) {
  const [url, setUrl] = useState('');
  const [startChapter, setStartChapter] = useState('');
  const [endChapter, setEndChapter] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadJobs, setDownloadJobs] = useState<DownloadJob[]>([]);

  // Load download jobs from localStorage on component mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('downloadJobs');
    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs).map((job: any) => ({
          ...job,
          createdAt: new Date(job.createdAt)
        }));
        setDownloadJobs(parsedJobs);
      } catch (error) {
        console.error('Failed to load download jobs:', error);
      }
    }
  }, []);

  // Save download jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('downloadJobs', JSON.stringify(downloadJobs));
  }, [downloadJobs]);

  const handleLinkFromBrowser = () => {
    const currentUrl = getCurrentUrl();
    if (currentUrl) {
      setUrl(currentUrl);
      toast({
        title: "URL Captured",
        description: "Current browser URL has been captured for download.",
      });
    } else {
      toast({
        title: "No URL Available",
        description: "Unable to capture URL from browser.",
        variant: "destructive",
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.startsWith('http')) {
        setUrl(clipboardText);
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

  const addDownloadJob = (site: string, url: string, startChapter?: number, endChapter?: number) => {
    const newJob: DownloadJob = {
      id: Date.now().toString(),
      site,
      url,
      startChapter,
      endChapter,
      status: 'pending',
      progress: 0,
      downloadedFiles: 0,
      totalFiles: 0,
      createdAt: new Date()
    };

    setDownloadJobs(prev => [newJob, ...prev]);
    return newJob.id;
  };

  const updateDownloadJob = (id: string, updates: Partial<DownloadJob>) => {
    setDownloadJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates } : job
    ));
  };

  const removeDownloadJob = (id: string) => {
    setDownloadJobs(prev => prev.filter(job => job.id !== id));
  };

  const handleDownload = async () => {
    if (!url) {
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

    const jobId = addDownloadJob(
      selectedSite,
      url,
      startChapter ? parseInt(startChapter) : undefined,
      endChapter ? parseInt(endChapter) : undefined
    );

    try {
      updateDownloadJob(jobId, { status: 'downloading' });

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site: selectedSite,
          url: url,
          startChapter: startChapter ? parseInt(startChapter) : undefined,
          endChapter: endChapter ? parseInt(endChapter) : undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.progress !== undefined) {
                  updateDownloadJob(jobId, { 
                    progress: data.progress,
                    downloadedFiles: data.downloadedFiles || 0,
                    totalFiles: data.totalFiles || 0
                  });
                }

                if (data.status) {
                  updateDownloadJob(jobId, { status: data.status });
                }
              } catch (e) {
                // Ignore parsing errors for partial data
              }
            }
          }
        }
      }

      updateDownloadJob(jobId, { status: 'completed', progress: 100 });

      toast({
        title: "Download Complete",
        description: "Manga has been downloaded successfully.",
      });

      // Reset form
      setUrl('');
      setStartChapter('');
      setEndChapter('');

    } catch (error) {
      console.error('Download error:', error);
      updateDownloadJob(jobId, { status: 'failed' });

      toast({
        title: "Download Failed",
        description: "Failed to download manga. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusIcon = (status: DownloadJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'downloading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: DownloadJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'downloading':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const canShowChapterRange = selectedSite === 'colamanga';

  return (
    <div className="space-y-6">
      {/* Download Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Manga URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="Enter manga URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isDownloading}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleLinkFromBrowser}
                disabled={isDownloading}
                title="Capture current browser URL"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePasteFromClipboard}
                disabled={isDownloading}
                title="Paste from clipboard"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {canShowChapterRange && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startChapter">Start Chapter (Optional)</Label>
                <Input
                  id="startChapter"
                  type="number"
                  placeholder="e.g., 1"
                  value={startChapter}
                  onChange={(e) => setStartChapter(e.target.value)}
                  disabled={isDownloading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endChapter">End Chapter (Optional)</Label>
                <Input
                  id="endChapter"
                  type="number"
                  placeholder="e.g., 10"
                  value={endChapter}
                  onChange={(e) => setEndChapter(e.target.value)}
                  disabled={isDownloading}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleDownload} 
            disabled={isDownloading || !url || !selectedSite}
            className="w-full"
          >
            {isDownloading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>

          {!selectedSite && (
            <p className="text-sm text-muted-foreground text-center">
              Please select a manga site from the sidebar first
            </p>
          )}
        </CardContent>
      </Card>

      {/* Download History */}
      {downloadJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Download History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {downloadJobs.map((job) => (
                  <div key={job.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <Badge variant="outline" className="capitalize">
                          {job.site}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-white ${getStatusColor(job.status)}`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDownloadJob(job.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground truncate">
                      {job.url}
                    </div>

                    {(job.startChapter || job.endChapter) && (
                      <div className="text-xs text-muted-foreground">
                        Chapters: {job.startChapter || '?'} - {job.endChapter || '?'}
                      </div>
                    )}

                    {job.status === 'downloading' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{job.downloadedFiles} / {job.totalFiles} files</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {job.createdAt.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}