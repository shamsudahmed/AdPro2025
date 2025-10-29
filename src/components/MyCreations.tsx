import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Creation {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
  expires_at: string;
}

export const MyCreations = () => {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreations = async () => {
    try {
      // First, delete expired creations
      await (supabase as any).rpc('delete_expired_creations');
      
      // Then fetch remaining creations
      const { data, error } = await (supabase as any)
        .from('creations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreations(data || []);
    } catch (error) {
      console.error('Error fetching creations:', error);
      toast.error("Failed to load creations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreations();
  }, []);

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creation-${id}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download image");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('creations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCreations(creations.filter(c => c.id !== id));
      toast.success("Creation deleted");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete creation");
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading your creations...</p>
      </div>
    );
  }

  if (creations.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl">🎨</div>
        <h3 className="text-xl font-semibold">No Creations Yet</h3>
        <p className="text-muted-foreground">
          Your saved advertisements will appear here and stay for 24 hours
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold">My Creations</h2>
        <p className="text-sm md:text-base text-muted-foreground">Your saved advertisements (expire in 24 hours)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {creations.map((creation) => (
          <Card key={creation.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={creation.image_url}
                alt="Saved creation"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm line-clamp-2">{creation.prompt}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {getTimeRemaining(creation.expires_at)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(creation.image_url, creation.id)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(creation.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
