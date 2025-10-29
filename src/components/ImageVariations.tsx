import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageVariation {
  imageUrl: string;
  style: string;
}

interface ImageVariationsProps {
  variations: ImageVariation[];
  prompt: string;
  onStartOver: () => void;
}

export const ImageVariations = ({ variations, prompt, onStartOver }: ImageVariationsProps) => {
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleDownload = async (imageUrl: string, style: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ad-${style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download image");
    }
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Advertisement',
          text: prompt,
          url: imageUrl,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
      toast.success("Image URL copied to clipboard!");
    }
  };

  const handleSave = async (imageUrl: string) => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('creations')
        .insert({
          image_url: imageUrl,
          prompt: prompt
        });

      if (error) throw error;

      toast.success("Saved to My Creations! Will expire in 24 hours.");
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save to My Creations");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in px-4">
      <Button
        onClick={onStartOver}
        variant="outline"
        size="default"
        className="mb-2 md:mb-4"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        Back to Home
      </Button>
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold">Choose Your Style</h2>
        <p className="text-sm md:text-base text-muted-foreground">Select the variation that best suits your needs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {variations.map((variation, index) => (
          <Card
            key={index}
            className={`overflow-hidden cursor-pointer transition-all ${
              selectedVariation === index
                ? 'ring-2 ring-primary shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedVariation(index)}
          >
            <div className="aspect-video relative">
              <img
                src={variation.imageUrl}
                alt={`${variation.style} variation`}
                className="w-full h-full object-cover"
              />
              {selectedVariation === index && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Selected
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{variation.style}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(variation.imageUrl, variation.style);
                  }}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(variation.imageUrl);
                  }}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(variation.imageUrl);
                  }}
                  disabled={saving}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
        <p className="text-xs md:text-sm text-muted-foreground mb-2">
          <strong>Your Prompt:</strong>
        </p>
        <p className="text-xs md:text-sm">{prompt}</p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={onStartOver} variant="outline" size="default" className="w-full sm:w-auto">
          Create Another Ad
        </Button>
      </div>
    </div>
  );
};
