import { Card } from "@/components/ui/card";
import { Sparkles, Target, Zap, Users } from "lucide-react";

export const AboutUs = () => {
  return (
    <div className="space-y-6 md:space-y-8 px-4 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">About AdPro QryX</h1>
        <p className="text-muted-foreground text-lg">
          Your AI-Powered Advertisement Creation Partner
        </p>
      </div>

      <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <p className="text-lg leading-relaxed">
          AdPro QryX is a cutting-edge AI-powered platform designed to revolutionize 
          the way you create professional advertisements. Our advanced technology 
          combines artificial intelligence with intuitive design to help you generate 
          stunning ad creatives in seconds.
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">AI-Powered Creation</h3>
          <p className="text-muted-foreground">
            Leverage state-of-the-art AI models to generate professional-quality 
            advertisements from simple text prompts.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Lightning Fast</h3>
          <p className="text-muted-foreground">
            Create multiple ad variations in seconds. No more waiting hours or days 
            for design drafts.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Precision Targeting</h3>
          <p className="text-muted-foreground">
            Analyze competitor ads and optimize your creatives for maximum impact 
            and engagement.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Built for Everyone</h3>
          <p className="text-muted-foreground">
            Whether you're a solo entrepreneur or a large agency, AdPro QryX scales 
            to meet your needs.
          </p>
        </Card>
      </div>

      <Card className="p-6 md:p-8 bg-muted/50">
        <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
        <p className="text-muted-foreground leading-relaxed">
          We believe that powerful marketing tools should be accessible to everyone. 
          AdPro QryX democratizes professional ad creation by combining advanced AI 
          technology with an intuitive interface. Our goal is to empower businesses 
          of all sizes to create compelling advertisements that drive results—without 
          requiring a design team or extensive technical knowledge.
        </p>
      </Card>
    </div>
  );
};
