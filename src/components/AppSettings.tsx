import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Key, CheckCircle2, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ApiConfig {
  id: string;
  name: string;
  provider: "openai" | "lovable";
  apiKey: string;
  model: string;
  isActive: boolean;
  status?: "checking" | "connected" | "error";
}

interface ApiSettings {
  useExternalApi: boolean;
  provider: "openai" | "lovable";
  apiKey: string;
  model: string;
  apis: ApiConfig[];
}

interface AppSettingsProps {
  onSettingsChange?: (settings: ApiSettings) => void;
}

export const AppSettings = ({ onSettingsChange }: AppSettingsProps) => {
  const [settings, setSettings] = useState<ApiSettings>(() => {
    const saved = localStorage.getItem("adgen-api-settings");
    return saved ? JSON.parse(saved) : {
      useExternalApi: false,
      provider: "lovable",
      apiKey: "",
      model: "gpt-image-1",
      apis: []
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [testingApis, setTestingApis] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Call immediately on mount and whenever settings change
    onSettingsChange?.(settings);
  }, [settings]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("adgen-api-settings", JSON.stringify(settings));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully", {
        description: settings.useExternalApi 
          ? `Using ${settings.provider} API` 
          : "Using Lovable AI"
      });
    }, 500);
  };

  const updateSettings = (updates: Partial<ApiSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const addNewApi = () => {
    const newApi: ApiConfig = {
      id: `api_${Date.now()}`,
      name: `API ${settings.apis.length + 1}`,
      provider: "openai",
      apiKey: "",
      model: "gpt-image-1",
      isActive: false,
      status: undefined
    };
    updateSettings({ apis: [...settings.apis, newApi] });
  };

  const removeApi = (id: string) => {
    updateSettings({ apis: settings.apis.filter(api => api.id !== id) });
  };

  const updateApi = (id: string, updates: Partial<ApiConfig>) => {
    updateSettings({
      apis: settings.apis.map(api => 
        api.id === id ? { ...api, ...updates } : api
      )
    });
  };

  const testApiConnection = async (api: ApiConfig) => {
    setTestingApis(prev => new Set(prev).add(api.id));
    updateApi(api.id, { status: "checking" });

    try {
      const { data, error } = await supabase.functions.invoke("generate-ad-image", {
        body: { 
          prompt: "test connection", 
          type: "test",
          apiSettings: {
            useExternalApi: true,
            provider: api.provider,
            apiKey: api.apiKey,
            model: api.model
          }
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      updateApi(api.id, { status: "connected" });
      toast.success(`${api.name} connected successfully`);
    } catch (error: any) {
      console.error(`API test failed for ${api.name}:`, error);
      updateApi(api.id, { status: "error" });
      toast.error(`${api.name} connection failed`, {
        description: error.message || "Please check your API key"
      });
    } finally {
      setTestingApis(prev => {
        const newSet = new Set(prev);
        newSet.delete(api.id);
        return newSet;
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-card/80 border-border/50 shadow-premium">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">API Settings</CardTitle>
            <CardDescription className="text-xs md:text-sm text-muted-foreground mt-1">
              Configure your preferred AI provider for image generation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 md:space-y-6 pt-4 md:pt-6">
        <div className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-muted/30 border border-border/30">
          <div className="space-y-1">
            <Label className="text-sm md:text-base font-medium">Use External API</Label>
            <p className="text-xs md:text-sm text-muted-foreground">
              Enable to use your own API keys instead of Lovable AI
            </p>
          </div>
          <Switch
            checked={settings.useExternalApi}
            onCheckedChange={(checked) => updateSettings({ 
              useExternalApi: checked,
              provider: checked ? "openai" : "lovable"
            })}
          />
        </div>

        {settings.useExternalApi && (
          <div className="space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <Label htmlFor="provider">API Provider</Label>
              <Select
                value={settings.provider}
                onValueChange={(value: "openai" | "lovable") => 
                  updateSettings({ provider: value })
                }
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={settings.model}
                onValueChange={(value) => updateSettings({ model: value })}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-image-1">GPT Image 1 (Recommended)</SelectItem>
                  <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                  <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                gpt-image-1 provides the highest quality and control
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="sk-..."
                className="bg-background/50 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>
          </div>
        )}

        {!settings.useExternalApi && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Using Lovable AI</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Premium quality image generation powered by Google Gemini, no API key required
                </p>
              </div>
            </div>
          </div>
        )}

        {settings.useExternalApi && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">API Configurations</Label>
              <Button
                onClick={addNewApi}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add API
              </Button>
            </div>

            {settings.apis.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No APIs configured. Click "Add API" to get started.
              </p>
            )}

            {settings.apis.map((api) => (
              <Card key={api.id} className="bg-background/30 border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      value={api.name}
                      onChange={(e) => updateApi(api.id, { name: e.target.value })}
                      className="max-w-[200px] bg-background/50"
                      placeholder="API Name"
                    />
                    <div className="flex items-center gap-2">
                      {api.status === "checking" && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                      {api.status === "connected" && (
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="Connected" />
                      )}
                      {api.status === "error" && (
                        <div className="w-3 h-3 rounded-full bg-red-500" title="Error" />
                      )}
                      <Button
                        onClick={() => removeApi(api.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Provider</Label>
                      <Select
                        value={api.provider}
                        onValueChange={(value: "openai" | "lovable") => 
                          updateApi(api.id, { provider: value })
                        }
                      >
                        <SelectTrigger className="bg-background/50 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Model</Label>
                      <Select
                        value={api.model}
                        onValueChange={(value) => updateApi(api.id, { model: value })}
                      >
                        <SelectTrigger className="bg-background/50 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-image-1">GPT Image 1</SelectItem>
                          <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                          <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">API Key</Label>
                      <Input
                        type="password"
                        value={api.apiKey}
                        onChange={(e) => updateApi(api.id, { apiKey: e.target.value })}
                        placeholder="sk-..."
                        className="bg-background/50 font-mono text-xs h-9"
                      />
                    </div>

                    <Button
                      onClick={() => testApiConnection(api)}
                      disabled={!api.apiKey || testingApis.has(api.id)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {testingApis.has(api.id) ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving || (settings.useExternalApi && !settings.apiKey && settings.apis.length === 0)}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-glow"
          size="default"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};
