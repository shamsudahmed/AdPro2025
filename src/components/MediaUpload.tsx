import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadProps {
  onImageUpload: (file: File, preview: string) => void;
  uploadedImage?: { file: File; preview: string } | null;
  onRemove: () => void;
}

export const MediaUpload = ({ onImageUpload, uploadedImage, onRemove }: MediaUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onImageUpload(file, preview);
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="p-4 md:p-6 backdrop-blur-sm bg-card/50 border-border">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base md:text-lg font-semibold text-foreground">Transform Image to Advertisement</h3>
            {uploadedImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Upload any image and our AI will transform it into a professional advertisement
          </p>
        </div>

        {!uploadedImage ? (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">
                  Drag and drop your image here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload any photo to transform it into a powerful advertisement (Max 10MB)
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-primary hover:bg-primary/10"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <img
              src={uploadedImage.preview}
              alt="Uploaded model"
              className="w-full h-64 object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Image
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        )}
      </div>
    </Card>
  );
};
