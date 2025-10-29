import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Download,
  Copy,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface SocialMediaShareProps {
  imageUrl: string;
  prompt: string;
}

export const SocialMediaShare = ({ imageUrl, prompt }: SocialMediaShareProps) => {
  const platforms = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      dimensions: "1200x630",
      action: () => shareToFacebook(),
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-br from-purple-600 to-pink-600 hover:opacity-90",
      dimensions: "1080x1080",
      action: () => shareToInstagram(),
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      dimensions: "1200x675",
      action: () => shareToTwitter(),
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      dimensions: "1200x627",
      action: () => shareToLinkedIn(),
    },
  ];

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(fbUrl, "_blank", "width=600,height=400");
    toast.success("Opening Facebook share dialog");
  };

  const shareToInstagram = () => {
    toast.info("Download the image and post it directly to Instagram app", {
      description: "Instagram doesn't support web posting",
    });
    downloadImage();
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      prompt
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    toast.success("Opening Twitter share dialog");
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(linkedInUrl, "_blank", "width=600,height=400");
    toast.success("Opening LinkedIn share dialog");
  };

  const downloadImage = async () => {
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
    }
  };

  const copyImageLink = () => {
    navigator.clipboard.writeText(imageUrl);
    toast.success("Image URL copied to clipboard!");
  };

  const shareNative = () => {
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
      copyImageLink();
    }
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/50 border-border">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">Share Your Ad</h3>
          <p className="text-sm text-muted-foreground">
            Post directly to social media or download for later
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <Button
              key={platform.name}
              onClick={platform.action}
              className={`${platform.color} text-white flex-col h-auto py-4 gap-2`}
            >
              <platform.icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">{platform.name}</div>
                <div className="text-xs opacity-80">{platform.dimensions}</div>
              </div>
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={downloadImage}
            variant="outline"
            className="flex-1 min-w-[150px] border-primary hover:bg-primary/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={copyImageLink}
            variant="outline"
            className="flex-1 min-w-[150px] border-primary hover:bg-primary/10"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button
            onClick={shareNative}
            variant="outline"
            className="flex-1 min-w-[150px] border-primary hover:bg-primary/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Each platform has optimal image dimensions.
            Download and resize for best results on each platform.
          </p>
        </div>
      </div>
    </Card>
  );
};
