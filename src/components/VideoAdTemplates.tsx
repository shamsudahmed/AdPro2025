import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Play, Package } from "lucide-react";

interface VideoTemplate {
  id: string;
  title: string;
  description: string;
  duration: string;
  style: string;
  thumbnail: string;
}

interface VideoAdTemplatesProps {
  onSelectTemplate: (template: VideoTemplate, productInfo?: ProductInfo) => void;
}

interface ProductInfo {
  name: string;
  description: string;
  features: string;
}

export const VideoAdTemplates = ({ onSelectTemplate }: VideoAdTemplatesProps) => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: "",
    description: "",
    features: ""
  });

  const templates: VideoTemplate[] = [
    {
      id: "product-showcase",
      title: "Product Showcase",
      description: "Dynamic 360° product rotation with premium lighting",
      duration: "15-30s",
      style: "Modern & Sleek",
      thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    },
    {
      id: "lifestyle-story",
      title: "Lifestyle Story",
      description: "Emotional storytelling with real people scenarios",
      duration: "30s",
      style: "Cinematic",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
    },
    {
      id: "before-after",
      title: "Before & After",
      description: "Transformation showcase with dramatic reveals",
      duration: "15s",
      style: "Bold Impact",
      thumbnail: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop",
    },
    {
      id: "testimonial",
      title: "Customer Testimonial",
      description: "Authentic customer reviews with b-roll footage",
      duration: "20-30s",
      style: "Trust Building",
      thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
    },
    {
      id: "social-proof",
      title: "Social Proof",
      description: "Fast-paced montage of users and results",
      duration: "15s",
      style: "Energetic",
      thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
    },
    {
      id: "unboxing",
      title: "Unboxing Experience",
      description: "ASMR-style product reveal with close-ups",
      duration: "20-30s",
      style: "Luxurious",
      thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    },
  ];

  const handleTemplateClick = (template: VideoTemplate) => {
    setSelectedTemplate(template);
    setShowProductForm(true);
  };

  const handleGenerateWithProduct = () => {
    if (selectedTemplate && productInfo.name && productInfo.description) {
      onSelectTemplate(selectedTemplate, productInfo);
      setShowProductForm(false);
      setProductInfo({ name: "", description: "", features: "" });
    }
  };

  if (showProductForm && selectedTemplate) {
    return (
      <div className="space-y-4 md:space-y-6 px-4 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-accent shadow-glow">
            <Package className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Define Your Product
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Template: {selectedTemplate.title}
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/50 border-border">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={productInfo.name}
                onChange={(e) => setProductInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Premium Wireless Headphones"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDesc">Product Description *</Label>
              <Textarea
                id="productDesc"
                value={productInfo.description}
                onChange={(e) => setProductInfo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what makes your product unique..."
                className="min-h-[100px] bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productFeatures">Key Features (Optional)</Label>
              <Textarea
                id="productFeatures"
                value={productInfo.features}
                onChange={(e) => setProductInfo(prev => ({ ...prev, features: e.target.value }))}
                placeholder="e.g., 40-hour battery life, Active noise cancellation, Premium leather ear cups"
                className="min-h-[80px] bg-background/50"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowProductForm(false)}
                variant="outline"
                className="flex-1"
              >
                Back to Templates
              </Button>
              <Button
                onClick={handleGenerateWithProduct}
                disabled={!productInfo.name || !productInfo.description}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                Generate Ad
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-accent shadow-glow animate-glow">
          <Video className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
          Video Ad Templates
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Choose a professional video ad template for inspiration
        </p>
        <p className="text-xs md:text-sm text-amber-500">
          💡 Note: Full video generation requires paid services. These templates provide structure and inspiration for your image ads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="group overflow-hidden backdrop-blur-sm bg-card/50 border-border hover:border-primary transition-all duration-300 hover:shadow-glow cursor-pointer"
            onClick={() => handleTemplateClick(template)}
          >
            <div className="relative">
              <img
                src={template.thumbnail}
                alt={template.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
              </div>
              <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs text-white">
                {template.duration}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {template.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {template.style}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateClick(template);
                  }}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
