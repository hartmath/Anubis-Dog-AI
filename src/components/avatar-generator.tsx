"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  Upload,
  Wand2,
  Download,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { aiStyleEnhancement } from "@/ai/flows/ai-style-enhancement";
import { cn } from "@/lib/utils";

const styles = [
  { id: "Neon Glow", name: "Neon Glow" },
  { id: "Dark Gold", name: "Dark Gold" },
  { id: "Cyberpunk Blue", name: "Cyberpunk Blue" },
  { id: "Cosmic Purple", name: "Cosmic Purple" },
];

export function AvatarGenerator() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>(styles[3].id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file.",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 10MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const result = await aiStyleEnhancement({ 
        avatarDataUri: originalImage,
        style: selectedStyle,
      });
      if (result.stylizedAvatarDataUri) {
        setGeneratedImage(result.stylizedAvatarDataUri);
      } else {
        throw new Error("The AI failed to generate an image.");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unknown error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = generatedImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0, 1080, 1080);

      const link = document.createElement("a");
      link.download = "anubis-dog-ai-avatar-1080x1080.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.onerror = () => {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not load the generated image for download.",
      });
    };
  };

  return (
    <div className="container max-w-5xl mx-auto py-12 md:py-20 px-4">
      <section id="upload" className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline text-primary mb-4">
          Transform Your Profile Picture
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Drag & drop your photo or click to upload. Our AI will work its magic to help you create a stunning new profile picture.
        </p>
        <div 
          className="w-full max-w-lg mx-auto aspect-video rounded-lg border-2 border-dashed border-primary/50 flex flex-col items-center justify-center text-center p-8 cursor-pointer group hover:border-primary transition-colors"
          onClick={triggerFileInput}
        >
           <Upload className="w-12 h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
           <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
           <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WEBP (Max. 10MB)</p>
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />
        </div>
      </section>

      {(originalImage || generatedImage) && (
        <section id="preview" className="mt-16 md:mt-24">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline text-foreground mb-2">Preview & Adjust</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI has generated your new avatar. The preview is shown on the right.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-center">
            <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                {originalImage ? (
                  <Image
                    src={originalImage}
                    alt="Original user upload"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="w-24 h-24 text-muted-foreground" />
                )}
            </div>
            <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                    <p className="text-lg text-primary font-headline">
                      Conjuring your avatar...
                    </p>
                  </div>
                )}
                {generatedImage ? (
                  <Image
                    src={generatedImage}
                    alt="Generated Anubis Avatar"
                    fill
                    className="object-cover animate-in fade-in duration-500"
                  />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Wand2 className="w-24 h-24 mx-auto text-primary" />
                    <p className="mt-4">Your AI generated avatar will appear here.</p>
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      <section id="style" className="mt-16 md:mt-24 text-center">
        <h2 className="text-3xl md:text-4xl font-headline text-foreground mb-2">Choose Your Style</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Select a preset to apply a unique visual filter to your creation.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xl font-headline p-4 transition-all duration-300",
                "bg-secondary hover:bg-primary/20",
                selectedStyle === style.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background text-primary" : "text-muted-foreground"
              )}
            >
              {style.name}
            </button>
          ))}
        </div>
      </section>

      <section id="download" className="mt-16 md:mt-24 text-center">
        <h2 className="text-3xl md:text-4xl font-headline text-foreground mb-2">Generate & Download</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Ready to show off your new look? Generate your final image.
        </p>
        <Button
          onClick={handleGenerate}
          disabled={!originalImage || isLoading}
          size="lg"
          className="w-full max-w-sm mx-auto font-bold text-lg py-7 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate
            </>
          )}
        </Button>
        {generatedImage &&
          <div className="mt-4">
            <Button
              onClick={handleDownload}
              variant="default"
              size="lg"
              className="w-full max-w-sm mx-auto font-bold text-lg py-7"
            >
              <Download className="mr-2 h-5 w-5" />
              Download (1080x1080 PNG)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Watermark: Anubis Dog AI - Transform Your Profile Now</p>
          </div>
        }
      </section>
    </div>
  );
}
