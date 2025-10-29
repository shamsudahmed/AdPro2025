import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ArrowLeft } from "lucide-react";

interface Suggestion {
  title: string;
  prompt: string;
  description: string;
}

interface PromptRefinementProps {
  suggestions: Suggestion[];
  onSelect: (prompt: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const PromptRefinement = ({
  suggestions,
  onSelect,
  onBack,
  isLoading,
}: PromptRefinementProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 md:space-y-6 px-4">
      <Button
        onClick={onBack}
        variant="outline"
        size="default"
        className="mb-2 md:mb-4"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        Back to Home
      </Button>
      <div className="text-center space-y-2 md:space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-accent shadow-glow animate-glow">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl md:text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
          Choose Your Style
        </h2>
        <p className="text-sm md:text-lg text-muted-foreground">
          Select the perfect advertising style for your campaign
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {suggestions.map((suggestion, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden backdrop-blur-sm bg-card/50 border-border hover:border-primary transition-all duration-300 hover:shadow-glow cursor-pointer"
            onClick={() => !isLoading && onSelect(suggestion.prompt)}
          >
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {suggestion.title}
                </h3>
                <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:shadow-glow flex items-center justify-center transition-all">
                  <Check className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {suggestion.description}
              </p>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {suggestion.prompt}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="default"
          disabled={isLoading}
          className="w-full sm:w-auto border-border hover:border-primary"
        >
          Start Over
        </Button>
      </div>
    </div>
  );
};
