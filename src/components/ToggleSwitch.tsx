import { Shield, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ToggleSwitchProps {
  adultMode: boolean;
  previewMode: boolean;
  onAdultModeChange: (enabled: boolean) => void;
  onPreviewModeChange: (enabled: boolean) => void;
}

export function ToggleSwitch({ 
  adultMode, 
  previewMode, 
  onAdultModeChange, 
  onPreviewModeChange 
}: ToggleSwitchProps) {
  return (
    <Card className="bg-manga-surface border-manga-border">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Preview Mode Toggle */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-3">
              {previewMode ? (
                <Eye className="w-5 h-5 text-accent" />
              ) : (
                <EyeOff className="w-5 h-5 text-manga-text-muted" />
              )}
              <div>
                <Label className="text-manga-text font-medium">
                  Preview Mode
                </Label>
                <p className="text-sm text-manga-text-muted">
                  Show website iframe for browsing
                </p>
              </div>
            </div>
            <Switch
              checked={previewMode}
              onCheckedChange={onPreviewModeChange}
              className="data-[state=checked]:bg-gradient-accent"
            />
          </div>

          {/* Separator */}
          <div className="border-t border-manga-border"></div>

          {/* Adult Mode Toggle */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-3">
              {adultMode ? (
                <ShieldCheck className="w-5 h-5 text-primary" />
              ) : (
                <Shield className="w-5 h-5 text-manga-text-muted" />
              )}
              <div>
                <Label className="text-manga-text font-medium">
                  Adult Content
                </Label>
                <p className="text-sm text-manga-text-muted">
                  Show 18+ content sites
                </p>
              </div>
            </div>
            <Switch
              checked={adultMode}
              onCheckedChange={onAdultModeChange}
              className="data-[state=checked]:bg-gradient-primary"
            />
          </div>

          {/* Adult Mode Warning */}
          {adultMode && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-primary text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">Adult mode enabled</span>
              </div>
              <p className="text-xs text-manga-text-muted mt-1">
                Adult content sites are now visible in the sidebar.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}