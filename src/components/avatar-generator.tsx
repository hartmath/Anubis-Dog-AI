"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  Upload,
  Wand2,
  Download,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { aiStyleEnhancement } from "@/ai/flows/ai-style-enhancement";

export function AvatarGenerator() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      const result = await aiStyleEnhancement({ avatarDataUri: originalImage });
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
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const watermarkLogo = new window.Image();
      watermarkLogo.src = "/logo.png";
      watermarkLogo.onload = () => {
        const watermarkHeight = Math.max(20, canvas.height * 0.1);
        const watermarkWidth =
          (watermarkLogo.width / watermarkLogo.height) * watermarkHeight;
        const padding = watermarkHeight * 0.25;

        ctx.globalAlpha = 0.8;
        ctx.drawImage(
          watermarkLogo,
          canvas.width - watermarkWidth - padding,
          canvas.height - watermarkHeight - padding,
          watermarkWidth,
          watermarkHeight
        );
        ctx.globalAlpha = 1.0;

        const link = document.createElement("a");
        link.download = "anubis-dog-ai-avatar.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      watermarkLogo.onerror = () => {
        // Fallback to text watermark if logo fails
        const watermarkText = "Anubis Dog AI";
        const fontSize = Math.max(
          12,
          Math.min(img.width / 20, img.height / 20)
        );
        ctx.font = `bold ${fontSize}px "Playfair Display", serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.textAlign = "right";
        ctx.fillText(
          watermarkText,
          canvas.width - fontSize,
          canvas.height - fontSize
        );

        const link = document.createElement("a");
        link.download = "anubis-dog-ai-avatar.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
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
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
        <Card className="aspect-square w-full flex items-center justify-center bg-card/50 border-2 border-dashed border-primary/50 relative overflow-hidden group transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
          <CardContent className="p-0 w-full h-full flex flex-col items-center justify-center">
            {originalImage ? (
              <Image
                src={originalImage}
                alt="Original user upload"
                fill
                className="object-cover"
                data-ai-hint="person portrait"
              />
            ) : (
              <div className="text-center text-muted-foreground p-4 sm:p-8">
                <ImageIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 mb-4" />
                <h3 className="font-headline text-xl sm:text-2xl mb-2 text-foreground">
                  Upload Your Portrait
                </h3>
                <p className="text-sm sm:text-base">Start by uploading a clear, front-facing photo.</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button onClick={triggerFileInput} variant="secondary">
                <Upload className="mr-2 h-4 w-4" />
                {originalImage ? "Change Image" : "Upload Image"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="aspect-square w-full flex items-center justify-center bg-card/50 relative overflow-hidden shadow-lg shadow-accent/10">
          <CardContent className="p-0 w-full h-full flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-primary mb-4" />
                <p className="text-base sm:text-lg text-primary font-headline">
                  Conjuring your avatar...
                </p>
              </div>
            )}
            {generatedImage ? (
              <Image
                src={generatedImage}
                alt="Generated Pharaoh Avatar"
                fill
                className="object-cover animate-in fade-in duration-500"
                data-ai-hint="pharaoh headdress"
              />
            ) : (
              <div className="text-center text-muted-foreground p-4 sm:p-8">
                <div className="p-3 sm:p-4 bg-primary/10 rounded-full inline-block mb-4">
                  <Wand2 className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                </div>
                <h3 className="font-headline text-xl sm:text-2xl mb-2 text-foreground">
                  Your Masterpiece Awaits
                </h3>
                <p className="text-sm sm:text-base">Your AI-generated Anubis avatar will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          onClick={handleGenerate}
          disabled={!originalImage || isLoading}
          size="lg"
          className="w-full sm:w-64 font-bold text-base sm:text-lg py-6 sm:py-7"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Avatar
            </>
          )}
        </Button>
        <Button
          onClick={handleDownload}
          disabled={!generatedImage || isLoading}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Avatar
        </Button>
      </div>
    </div>
  );
}
