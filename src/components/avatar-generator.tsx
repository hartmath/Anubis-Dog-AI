"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AvatarGenerator() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container max-w-5xl mx-auto py-12 md:py-20 px-4">
      <section id="upload" className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline text-primary mb-4">
          Create Your Anubis Dog AI Avatar
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Upload your photo to get started.
        </p>
        <div 
          className="w-full max-w-md mx-auto aspect-video rounded-lg border-2 border-dashed border-primary/50 flex flex-col items-center justify-center text-center p-6 md:p-8 cursor-pointer group hover:border-primary transition-colors"
          onClick={triggerFileInput}
        >
           <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
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

      {originalImage && (
        <section id="preview" className="mt-12 md:mt-16">
          <div className="flex flex-col items-center">
              <h3 className="text-xl md:text-2xl font-headline text-foreground mb-4">Your Image</h3>
              <div className="aspect-square w-full max-w-md rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                  {originalImage ? (
                    <Image
                      src={originalImage}
                      alt="Original user upload"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground" />
                  )}
              </div>
            </div>
        </section>
      )}
    </div>
  );
}
