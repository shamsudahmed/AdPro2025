import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface LinkAnalyzerProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
}

export const LinkAnalyzer = ({ onAnalyze, isLoading }: LinkAnalyzerProps) => {
  const [url, setUrl] = useState("");

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Validate URL format
    try {
      new URL(url);
      onAnalyze(url.trim());
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const isValidDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return (
        domain.includes("youtube.com") ||
        domain.includes("youtu.be") ||
        domain.includes("instagram.com") ||
        domain.includes("facebook.com") ||
        domain.includes("tiktok.com")
      );
    } catch {
      return false;
    }
  };

  return (
    <Card className="p-4 md:p-6 backdrop-blur-sm bg-card/50 border-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Analyze Advertisement Link
          </h3>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          Paste a link to a YouTube, Instagram, Facebook, or TikTok ad to create something similar
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
            disabled={isLoading}
            className="flex-1 bg-background/50 text-sm"
          />
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto bg-gradient-primary hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </div>
        {url && !isValidDomain(url) && url.includes("http") && (
          <p className="text-sm text-amber-500">
            ⚠️ For best results, use links from YouTube, Instagram, Facebook, or TikTok
          </p>
        )}
      </div>
    </Card>
  );
};
