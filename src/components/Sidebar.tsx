import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Site {
  id: string;
  name: string;
  url: string;
  faviconUrl: string;
  isAdult?: boolean;
}

interface SidebarProps {
  sites: Site[];
  selectedSite: string | null;
  onSiteSelect: (siteId: string, url: string) => void;
  isAdultMode: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ 
  sites, 
  selectedSite, 
  onSiteSelect, 
  isAdultMode, 
  collapsed,
  onToggleCollapse 
}: SidebarProps) {
  const filteredSites = sites.filter(site => isAdultMode || !site.isAdult);

  return (
    <div className={cn(
      "relative bg-manga-surface border-r border-manga-border transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Collapse Toggle */}
      <Button
        variant="manga-ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-manga-surface border border-manga-border hover:bg-manga-surface-hover shadow-lg"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Header */}
      <div className="p-6 border-b border-manga-border">
        {!collapsed && (
          <h2 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            Manga Sites
          </h2>
        )}
      </div>

      {/* Site List */}
      <div className="p-4 space-y-3">
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
      </div>

      {/* Adult Mode Indicator (when collapsed) */}
      {collapsed && isAdultMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}