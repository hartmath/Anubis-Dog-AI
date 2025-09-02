"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { Upload, ImageIcon, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { generateAvatar, type GenerateAvatarInput } from "@/ai/flows/generate-avatar-flow";

export function AvatarGenerator() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for DALL-E
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
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

  const handleGenerateClick = async () => {
    if (!originalImage) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image first.",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const input: GenerateAvatarInput = { photoDataUri: originalImage };
      const result = await generateAvatar(input);
      setGeneratedImage(result.avatarDataUri);
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Something went wrong while creating your avatar. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-12 md:py-20 px-4">
      <section id="upload" className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline text-primary mb-4">
          Create Your Anubis Dog AI Avatar
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Upload your photo to get started. The AI will generate a new avatar in the Anubis style.
        </p>
        <div 
          className="w-full max-w-md mx-auto aspect-video rounded-lg border-2 border-dashed border-primary/50 flex flex-col items-center justify-center text-center p-6 md:p-8 cursor-pointer group hover:border-primary transition-colors"
          onClick={triggerFileInput}
        >
           <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
           <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
           <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WEBP (Max. 4MB)</p>
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />
        </div>
      </section>

      {originalImage && (
        <section id="generation-controls" className="text-center mt-8">
          <Button size="lg" onClick={handleGenerateClick} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Your Anubis Avatar"
            )}
          </Button>
        </section>
      )}

      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {originalImage && (
          <div className="flex flex-col items-center">
            <h3 className="text-xl md:text-2xl font-headline text-foreground mb-4">Your Image</h3>
            <div className="aspect-square w-full max-w-md rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                <Image
                  src={originalImage}
                  alt="Original user upload"
                  fill
                  className="object-cover"
                />
            </div>
          </div>
        )}

        {isGenerating && !generatedImage && (
            <div className="flex flex-col items-center">
                <h3 className="text-xl md:text-2xl font-headline text-foreground mb-4">Generating Avatar...</h3>
                <div className="aspect-square w-full max-w-md rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader2 className="w-16 h-16 animate-spin text-primary"/>
                        <p>The AI is creating your masterpiece...</p>
                    </div>
                </div>
            </div>
        )}

        {generatedImage && (
            <div className="flex flex-col items-center">
                <h3 className="text-xl md:text-2xl font-headline text-foreground mb-4">Your Anubis Avatar</h3>
                <div className="aspect-square w-full max-w-md rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                    <Image
                      src={generatedImage}
                      alt="AI generated Anubis avatar"
                      fill
                      className="object-cover"
                    />
                </div>
                <Button asChild size="lg" className="mt-6">
                    <a href={generatedImage} download="anubis-avatar.png">
                        <Download className="mr-2 h-5 w-5" />
                        Download Avatar
                    </a>
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
