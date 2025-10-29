import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Wand2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  appRole?: string;
  onAppRoleChange?: (role: string) => void;
}

export const PromptInput = ({ onSubmit, isLoading, placeholder, appRole, onAppRoleChange }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div className="backdrop-blur-sm bg-card/50 rounded-2xl p-4 md:p-8 border border-border shadow-card">
        <div className="space-y-4">
          {onAppRoleChange && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                App/Brand Context (Optional)
              </label>
              <Textarea
                placeholder="e.g., Luxury fashion brand, Tech startup, Eco-friendly products, Healthcare app..."
                value={appRole || ""}
                onChange={(e) => onAppRoleChange(e.target.value)}
                className="min-h-[80px] resize-none bg-background/50 border-border focus:border-primary transition-colors"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Define your app's role or brand identity to ensure generated images align with your brand
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Describe your advertisement
            </label>
            <Textarea
              placeholder={placeholder || "e.g., A sleek smartphone advertisement showcasing the latest model with elegant minimalist design, emphasizing premium quality and innovation..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none bg-background/50 border-border focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            {isLoading ? "Processing..." : placeholder ? "Generate Advertisement" : "Refine My Prompt"}
          </Button>
        </div>
      </div>
    </div>
  );
};
