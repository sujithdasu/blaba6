
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Shield,
  Globe
} from 'lucide-react';

interface SidebarProps {
  onSiteSelect: (siteId: string, url: string) => void;
  isAdultMode: boolean;
  setIsAdultMode: (enabled: boolean) => void;
  selectedSite?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ 
  onSiteSelect, 
  isAdultMode, 
  setIsAdultMode, 
  selectedSite,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdultOnly, setShowAdultOnly] = useState(false);

  const sites = [
    {
      id: 'colamanga',
      name: 'ColaManga',
      url: 'https://www.colamanga.com',
      faviconUrl: 'https://www.colamanga.com/favicon.ico',
      isAdult: false,
      description: 'Popular manga reader with extensive collection'
    },
    {
      id: 'asurascans',
      name: 'AsuraScans',
      url: 'https://asuracomic.net',
      faviconUrl: 'https://asuracomic.net/favicon.ico',
      isAdult: false,
      description: 'High-quality scanlations and translations'
    },
    {
      id: 'nhentai',
      name: 'NHentai',
      url: 'https://nhentai.net',
      faviconUrl: 'https://nhentai.net/favicon.ico',
      isAdult: true,
      description: 'Adult manga and doujinshi collection'
    },
    {
      id: 'hentai2read',
      name: 'Hentai2Read',
      url: 'https://hentai2read.com',
      faviconUrl: 'https://hentai2read.com/favicon.ico',
      isAdult: true,
      description: 'Adult manga reading platform'
    },
    {
      id: 'hitomi',
      name: 'Hitomi.la',
      url: 'https://hitomi.la',
      faviconUrl: 'https://hitomi.la/favicon.ico',
      isAdult: true,
      description: 'Gallery-style adult content'
    },
    {
      id: 'erosscans',
      name: 'ErosScans',
      url: 'https://erosscans.com',
      faviconUrl: '/favicon.ico',
      isAdult: true,
      description: 'Adult manga scanlations'
    }
  ];

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdultFilter = showAdultOnly ? site.isAdult : true;
    const showAdult = isAdultMode || !site.isAdult;
    
    return matchesSearch && matchesAdultFilter && showAdult;
  });

  const adultSitesCount = sites.filter(site => site.isAdult).length;
  const totalSitesCount = sites.length;

  return (
    <Card className={cn(
      "h-full flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-80"
    )}>
      <CardHeader className={cn("pb-3", collapsed && "px-2")}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <CardTitle className="text-lg">Manga Sites</CardTitle>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {!collapsed && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Adult Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Label htmlFor="adult-mode" className="text-sm font-medium">
                  Adult Mode
                </Label>
              </div>
              <Switch
                id="adult-mode"
                checked={isAdultMode}
                onCheckedChange={setIsAdultMode}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={showAdultOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdultOnly(!showAdultOnly)}
                disabled={!isAdultMode}
                className="h-7 text-xs"
              >
                {showAdultOnly ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                Adult Only
              </Button>
            </div>

            <Separator />

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{filteredSites.length} sites</span>
              <span>
                <Globe className="inline h-3 w-3 mr-1" />
                {totalSitesCount - adultSitesCount} general, {adultSitesCount} adult
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex-1 overflow-hidden", collapsed && "px-2")}>
        <ScrollArea className="h-full">
          {/* Site List */}
          <div className="space-y-3">
            {filteredSites.map((site) => (
              <button
                key={site.id}
                onClick={() => onSiteSelect(site.id, site.url)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                  "border border-manga-border hover:border-primary/50",
                  "hover:bg-manga-surface-hover hover:shadow-glow-primary",
                  selectedSite === site.id && "bg-gradient-primary shadow-glow-primary border-primary",
                  collapsed && "justify-center p-2"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 rounded-lg overflow-hidden bg-white/10 border border-manga-border",
                  collapsed ? "w-8 h-8" : "w-10 h-10"
                )}>
                  <img
                    src={site.faviconUrl}
                    alt={site.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23${site.id.slice(0, 6)}" rx="4"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${site.name.slice(0, 2).toUpperCase()}</text></svg>`;
                    }}
                  />
                </div>
                
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium text-manga-text">{site.name}</div>
                    {site.isAdult && (
                      <div className="text-xs text-accent font-medium">18+</div>
                    )}
                  </div>
                )}
              </button>
            ))}

            {filteredSites.length === 0 && !collapsed && (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sites found</p>
                <p className="text-xs">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
