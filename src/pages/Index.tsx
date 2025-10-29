import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { PromptRefinement } from "@/components/PromptRefinement";
import { ImageGenerator } from "@/components/ImageGenerator";
import { ImageVariations } from "@/components/ImageVariations";
import { MyCreations } from "@/components/MyCreations";
import { MediaUpload } from "@/components/MediaUpload";
import { LinkAnalyzer } from "@/components/LinkAnalyzer";
import { VideoAdTemplates } from "@/components/VideoAdTemplates";
import { AppSettings } from "@/components/AppSettings";
import { MobileNav } from "@/components/MobileNav";
import { HomePage } from "@/components/HomePage";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AboutUs } from "@/components/AboutUs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Home, Video, Link2, FolderOpen, Settings as SettingsIcon, Info } from "lucide-react";

type Step = "input" | "refine" | "generate" | "video-templates" | "direct-generate" | "variations";

interface Suggestion {
  title: string;
  prompt: string;
  description: string;
}

interface UploadedImage {
  file: File;
  preview: string;
}

interface ImageVariation {
  imageUrl: string;
  style: string;
}

const Index = () => {
  const [step, setStep] = useState<Step>("input");
  const [activeTab, setActiveTab] = useState("home");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [imageVariations, setImageVariations] = useState<ImageVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [appRole, setAppRole] = useState("");
  const [apiSettings, setApiSettings] = useState<any>(() => {
    const saved = localStorage.getItem("adgen-api-settings");
    return saved ? JSON.parse(saved) : {
      useExternalApi: false,
      provider: "lovable",
      apiKey: "",
      model: "gpt-image-1"
    };
  });

  const handlePromptSubmit = async (prompt: string) => {
    setIsLoading(true);
    setOriginalPrompt(prompt);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-ad-image", {
        body: { prompt, type: "suggest", appRole, apiSettings },
      });

      if (error) throw error;

      if (data.error) {
        console.error('Edge function error:', data.error);
        toast.error(data.error);
        return;
      }

      setSuggestions(data.suggestions);
      setStep("refine");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to refine prompt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAnalyze = async (url: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-ad-image", {
        body: { referenceUrl: url, type: "analyze" },
      });

      if (error) throw error;

      if (data.error) {
        console.error('Edge function error:', data.error);
        toast.error(data.error);
        return;
      }

      setAnalysisResult(data.analysis);
      toast.success("Link analyzed! Review the insights below.", {
        description: "Now refine your prompt based on the analysis",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to analyze link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoTemplateSelect = (template: any, productInfo?: any) => {
    if (productInfo) {
      const productPrompt = `Create a ${template.style} style advertisement for "${productInfo.name}". 
Product Description: ${productInfo.description}
${productInfo.features ? `Key Features: ${productInfo.features}` : ''}
Style Inspiration: ${template.description}
Focus on professional composition, ${template.style.toLowerCase()} aesthetics, and highlighting the product's unique value proposition.`;
      
      setSelectedPrompt(productPrompt);
      handleDirectGenerate(productPrompt);
      setActiveTab("text-to-ad");
    } else {
      const templatePrompt = `Create a ${template.style} style advertisement inspired by "${template.title}": ${template.description}. Focus on professional composition and ${template.style.toLowerCase()} aesthetics.`;
      setOriginalPrompt(templatePrompt);
      setStep("input");
      setActiveTab("text-to-ad");
      toast.success(`Template "${template.title}" loaded!`, {
        description: "You can now refine this prompt",
      });
    }
  };

  const handlePromptSelect = async (prompt: string) => {
    setIsLoading(true);
    setSelectedPrompt(prompt);
    
    try {
      // Convert uploaded image to base64 if exists
      let imageBase64 = null;
      if (uploadedImage) {
        imageBase64 = uploadedImage.preview;
      }

      const { data, error } = await supabase.functions.invoke("generate-ad-image", {
        body: { 
          prompt, 
          type: "generate",
          imageBase64,
          appRole,
          apiSettings
        },
      });

      if (error) throw error;

      if (data.error) {
        console.error('Edge function error:', data.error);
        toast.error(data.error);
        return;
      }

      // Check if we got variations (multiple images) or single image
      if (data.variations) {
        setImageVariations(data.variations);
        setStep("variations");
        toast.success(`Generated ${data.variations.length} style variations!`);
      } else {
        setGeneratedImageUrl(data.imageUrl);
        setStep("generate");
        toast.success("Advertisement generated successfully!");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectGenerate = async (prompt: string) => {
    setIsLoading(true);
    setSelectedPrompt(prompt);
    
    try {
      let imageBase64 = null;
      if (uploadedImage) {
        imageBase64 = uploadedImage.preview;
      }

      const { data, error } = await supabase.functions.invoke("generate-ad-image", {
        body: { 
          prompt, 
          type: "generate",
          imageBase64,
          appRole,
          apiSettings
        },
      });

      if (error) throw error;

      if (data.error) {
        console.error('Edge function error:', data.error);
        toast.error(data.error);
        return;
      }

      // Check if we got variations (multiple images) or single image
      if (data.variations) {
        setImageVariations(data.variations);
        setStep("variations");
        toast.success(`Generated ${data.variations.length} style variations!`);
      } else {
        setGeneratedImageUrl(data.imageUrl);
        setStep("direct-generate");
        toast.success("Advertisement generated successfully!");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep("input");
    setOriginalPrompt("");
    setSuggestions([]);
    setSelectedPrompt("");
    setGeneratedImageUrl("");
    setImageVariations([]);
    setUploadedImage(null);
    setAnalysisResult("");
    setAppRole("");
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden pb-20 md:pb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* Mobile & Desktop Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 md:h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-lg md:text-xl">AdPro QryX</h1>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-12">
        {step === "input" && (
          <div className="space-y-6 md:space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl mx-auto">
              {/* Desktop Tabs */}
              <TabsList className="hidden md:grid w-full grid-cols-7 bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="home" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </TabsTrigger>
                <TabsTrigger value="text-to-ad" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Text to Ad
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-2">
                  <Video className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="analyze" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Analyze
                </TabsTrigger>
                <TabsTrigger value="creations" className="gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Saved
                </TabsTrigger>
                <TabsTrigger value="about" className="gap-2">
                  <Info className="w-4 h-4" />
                  About
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="home" className="mt-4 md:mt-6">
                <HomePage onNavigate={setActiveTab} />
              </TabsContent>

              <TabsContent value="text-to-ad" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                  <div className="text-center space-y-2 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Text to Advertisement</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Generate powerful ads instantly from your text or transform uploaded images into stunning advertisements
                    </p>
                  </div>
                  
                  <PromptInput 
                    onSubmit={handleDirectGenerate} 
                    isLoading={isLoading}
                    placeholder="Describe your advertisement or upload an image to transform..."
                    appRole={appRole}
                    onAppRoleChange={setAppRole}
                  />
                  
                  <MediaUpload
                    onImageUpload={(file, preview) => setUploadedImage({ file, preview })}
                    uploadedImage={uploadedImage}
                    onRemove={() => setUploadedImage(null)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="create" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                <PromptInput 
                  onSubmit={handlePromptSubmit} 
                  isLoading={isLoading}
                  appRole={appRole}
                  onAppRoleChange={setAppRole}
                />
                
                <div className="grid md:grid-cols-1 gap-4 md:gap-6 max-w-4xl mx-auto">
                  <MediaUpload
                    onImageUpload={(file, preview) => setUploadedImage({ file, preview })}
                    uploadedImage={uploadedImage}
                    onRemove={() => setUploadedImage(null)}
                  />
                </div>

                {analysisResult && (
                  <div className="max-w-4xl mx-auto p-4 md:p-6 backdrop-blur-sm bg-card/50 rounded-2xl border border-border">
                    <h3 className="text-base md:text-lg font-semibold text-foreground mb-3">
                      Analysis Insights
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-wrap">
                      {analysisResult}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="video" className="mt-4 md:mt-6">
                <VideoAdTemplates onSelectTemplate={handleVideoTemplateSelect} />
              </TabsContent>

              <TabsContent value="analyze" className="mt-4 md:mt-6">
                <div className="max-w-4xl mx-auto">
                  <LinkAnalyzer 
                    onAnalyze={handleLinkAnalyze}
                    isLoading={isLoading}
                  />
                </div>
              </TabsContent>

              <TabsContent value="creations" className="mt-4 md:mt-6">
                <div className="max-w-6xl mx-auto">
                  <MyCreations />
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-4 md:mt-6">
                <div className="max-w-6xl mx-auto">
                  <AboutUs />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4 md:mt-6">
                <AppSettings onSettingsChange={setApiSettings} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {step === "refine" && (
          <PromptRefinement
            suggestions={suggestions}
            onSelect={handlePromptSelect}
            onBack={handleStartOver}
            isLoading={isLoading}
          />
        )}

        {step === "variations" && (
          <div className="max-w-6xl mx-auto">
            <ImageVariations
              variations={imageVariations}
              prompt={selectedPrompt}
              onStartOver={handleStartOver}
            />
          </div>
        )}

        {(step === "generate" || step === "direct-generate") && (
          <ImageGenerator
            imageUrl={generatedImageUrl}
            prompt={selectedPrompt}
            onStartOver={handleStartOver}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4 px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-base md:text-lg font-medium text-foreground">
              {step === "refine" ? "Refining your prompt..." : "Creating your advertisement..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
