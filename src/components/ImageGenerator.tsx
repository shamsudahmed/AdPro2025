import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, ArrowLeft } from "lucide-react";
import { SocialMediaShare } from "@/components/SocialMediaShare";
import { toast } from "sonner";

interface ImageGeneratorProps {
  imageUrl: string;
  prompt: string;
  onStartOver: () => void;
}

export const ImageGenerator = ({
  imageUrl,
  prompt,
  onStartOver,
}: ImageGeneratorProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ad-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "My AI Generated Advertisement",
          text: prompt,
          url: imageUrl,
        })
        .then(() => toast.success("Shared successfully!"))
        .catch(() => toast.error("Failed to share"));
    } else {
      navigator.clipboard.writeText(imageUrl);
      toast.success("Image URL copied to clipboard!");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 md:space-y-6 px-4">
      <Button
        onClick={onStartOver}
        variant="outline"
        size="default"
        className="mb-2 md:mb-4"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        Back to Home
      </Button>
      <div className="text-center space-y-2 md:space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-secondary shadow-glow animate-float">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl md:text-4xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
          Your Advertisement
        </h2>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {prompt}
        </p>
      </div>

      <div className="backdrop-blur-sm bg-card/50 rounded-2xl p-4 md:p-8 border border-border shadow-card">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 rounded-xl transition-opacity" />
          <img
            src={imageUrl}
            alt="Generated advertisement"
            className="w-full h-auto rounded-xl shadow-glow"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mt-4 md:mt-6 justify-center">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            size="default"
            className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="default"
            className="w-full sm:w-auto border-primary hover:bg-primary/10"
          >
            <Share2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Share
          </Button>
          <Button
            onClick={onStartOver}
            variant="outline"
            size="default"
            className="w-full sm:w-auto border-border hover:border-primary"
          >
            Create Another
          </Button>
        </div>
      </div>

      <SocialMediaShare imageUrl={imageUrl} prompt={prompt} />
    </div>
  );
};
