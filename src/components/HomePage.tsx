import { Home, Sparkles, Video, Link2, FolderOpen, Settings, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

const navigationCards = [
  {
    id: "text-to-ad",
    title: "Text to Ad",
    description: "Generate powerful ads instantly from your text or transform uploaded images",
    icon: Home,
    gradient: "from-primary/20 to-accent/20",
    iconBg: "bg-gradient-primary"
  },
  {
    id: "create",
    title: "Refine Ad",
    description: "Refine and enhance your ad prompts with AI-powered suggestions",
    icon: Sparkles,
    gradient: "from-accent/20 to-primary/20",
    iconBg: "bg-gradient-accent"
  },
  {
    id: "video",
    title: "Templates",
    description: "Choose from professional video ad templates to jumpstart your creativity",
    icon: Video,
    gradient: "from-accent-secondary/20 to-primary/20",
    iconBg: "bg-gradient-secondary"
  },
  {
    id: "analyze",
    title: "Analyze Link",
    description: "Analyze competitor ads and landing pages for insights",
    icon: Link2,
    gradient: "from-primary/20 to-accent-secondary/20",
    iconBg: "bg-gradient-primary"
  },
  {
    id: "creations",
    title: "My Creations",
    description: "View and manage all your generated advertisements",
    icon: FolderOpen,
    gradient: "from-accent/20 to-accent-secondary/20",
    iconBg: "bg-gradient-accent"
  },
  {
    id: "settings",
    title: "Settings",
    description: "Configure API settings and customize your experience",
    icon: Settings,
    gradient: "from-muted/20 to-primary/20",
    iconBg: "bg-gradient-secondary"
  }
];

export const HomePage = ({ onNavigate }: HomePageProps) => {
  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-primary shadow-glow mb-4">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Welcome to AdBuilder
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Create stunning advertisements with AI-powered tools. Choose a feature below to get started.
        </p>
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto px-4">
        {navigationCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:shadow-premium transition-all duration-300 cursor-pointer"
              onClick={() => onNavigate(card.id)}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <CardHeader className="relative">
                <div className={`inline-flex w-12 h-12 rounded-xl ${card.iconBg} items-center justify-center mb-3 shadow-card`}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {card.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <Button
                  variant="ghost"
                  className="w-full justify-between group-hover:bg-primary/10 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats or Features Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-4">
        <div className="text-center p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border">
          <div className="text-2xl md:text-3xl font-bold text-primary">AI</div>
          <div className="text-xs md:text-sm text-muted-foreground">Powered</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border">
          <div className="text-2xl md:text-3xl font-bold text-accent">Fast</div>
          <div className="text-xs md:text-sm text-muted-foreground">Generation</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border">
          <div className="text-2xl md:text-3xl font-bold text-accent-secondary">Pro</div>
          <div className="text-xs md:text-sm text-muted-foreground">Quality</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border">
          <div className="text-2xl md:text-3xl font-bold text-primary-glow">Easy</div>
          <div className="text-xs md:text-sm text-muted-foreground">To Use</div>
        </div>
      </div>
    </div>
  );
};
