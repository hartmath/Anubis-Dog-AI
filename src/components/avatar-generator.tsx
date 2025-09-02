"use client";

import { useState, useRef, type ChangeEvent, useEffect } from "react";
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
import { cn } from "@/lib/utils";

const styles = [
  { id: "Neon Glow", name: "Neon Glow", color: "hsla(328, 100%, 54%, 0.3)" },
  { id: "Dark Gold", name: "Dark Gold", color: "hsla(45, 85%, 50%, 0.3)" },
  { id: "Cyberpunk Blue", name: "Cyberpunk Blue", color: "hsla(217, 100%, 50%, 0.3)" },
  { id: "Cosmic Purple", name: "Cosmic Purple", color: "hsla(270, 100%, 60%, 0.3)" },
];

export function AvatarGenerator() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>(styles[1].id);
  const [downloadCount, setDownloadCount] = useState(1);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState('AI is crafting your avatar...');
  const [useDirectAI, setUseDirectAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateSectionRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (originalImage && generateSectionRef.current) {
      generateSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [originalImage]);

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
      const style = styles.find(s => s.id === selectedStyle);
      if (!style) throw new Error("Selected style not found.");

      // Try direct client-side AI first for fastest results
      if (useDirectAI || navigator.onLine === false) {
        await handleDirectAI(style);
        return;
      }

      // Update loading message
      setLoadingMessage('Connecting to free AI services...');
      setCurrentProvider('');

      // Call the AI API for image generation
      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userImage: originalImage,
          style: style.name,
          prompt: `Transform this photo into an ancient Egyptian Anubis-themed avatar with ${style.name.toLowerCase()} aesthetic. Include pharaoh headdress, Egyptian jewelry, and mystical elements.`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate avatar');
      }

      const result = await response.json();
      
      if (result.success && result.data.generatedImage) {
        setGeneratedImage(result.data.generatedImage);
        setCurrentProvider(result.data.provider || 'AI');
        
        // Show success message with provider info
        toast({
          title: "Avatar Generated Successfully!",
          description: `Your AI-powered Anubis avatar is ready! Generated using ${result.data.provider || 'AI'}.`,
        });
      } else {
        throw new Error('Invalid response from AI service');
      }

    } catch (error) {
      console.error('AI Generation error:', error);
      
      // Try client-side AI processing as fallback
      try {
        setLoadingMessage('Switching to enhanced processing...');
        setCurrentProvider('Client-Side AI');
        
        toast({
          title: "Switching to Enhanced Processing",
          description: "Using advanced client-side AI enhancement...",
        });

        const { AdvancedCanvasProcessor } = await import('@/lib/free-ai-providers');
        const enhancedImage = await AdvancedCanvasProcessor.processImage(
          originalImage,
          style.name,
          (progress) => {
            setLoadingMessage(`Processing: ${progress}%`);
          }
        );
        
        setGeneratedImage(enhancedImage);
        setCurrentProvider('Enhanced Processing');
        
        toast({
          title: "Avatar Enhanced Successfully!",
          description: "Your avatar has been processed with advanced AI-like effects.",
        });
        
      } catch (fallbackError) {
        console.error('Fallback processing failed:', fallbackError);
        
        // Final fallback to simple canvas generation
        setLoadingMessage('Applying basic enhancements...');
        setCurrentProvider('Basic Processing');
        
        toast({
          title: "Using Basic Processing",
          description: "Applying color enhancements to your image...",
        });
        
        await handleCanvasGeneration();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback canvas-based generation (simplified version of original)
  const handleCanvasGeneration = async () => {
    if (!originalImage) return;

    try {
      const style = styles.find(s => s.id === selectedStyle);
      if (!style) throw new Error("Selected style not found.");
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context.");

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = originalImage;

      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Apply color overlay with the selected style
          ctx.globalCompositeOperation = 'multiply';
          const alphaMatch = style.color.match(/hsla\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
          const enhancedColor = alphaMatch 
            ? `hsla(${alphaMatch[1]}, ${alphaMatch[2]}, ${alphaMatch[3]}, 0.4)`
            : style.color.replace(/0\.3(?=\))/, '0.4');
          ctx.fillStyle = enhancedColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';

          setGeneratedImage(canvas.toDataURL("image/png"));
          resolve();
        };

        img.onerror = () => {
          reject(new Error("Failed to load original image onto canvas."));
        };
      });

    } catch (error) {
      console.error('Canvas generation error:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Unable to process the image. Please try again with a different image.",
      });
    }
  };

  // Direct client-side AI processing
  const handleDirectAI = async (style: any) => {
    try {
      setLoadingMessage('Initializing AI processing...');
      setCurrentProvider('Direct AI');

      const { AdvancedCanvasProcessor } = await import('@/lib/free-ai-providers');
      const enhancedImage = await AdvancedCanvasProcessor.processImage(
        originalImage!,
        style.name,
        (progress) => {
          setLoadingMessage(`AI Processing: ${progress}%`);
        }
      );
      
      setGeneratedImage(enhancedImage);
      setCurrentProvider('Client-Side AI');
      
      toast({
        title: "Avatar Generated Successfully!",
        description: "Your avatar has been enhanced with AI-powered effects!",
      });
      
    } catch (error) {
      console.error('Direct AI processing failed:', error);
      setLoadingMessage('Applying basic enhancements...');
      await handleCanvasGeneration();
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
      if (!ctx) {
        toast({
          variant: "destructive",
          title: "Download failed",
          description: "Could not create canvas context for download.",
        });
        return;
      }
      
      const logo = new window.Image();
      logo.src = "/logo.png";
      logo.onload = () => {
        ctx.drawImage(img, 0, 0, 1080, 1080);
        
        // Draw watermark
        ctx.globalAlpha = 0.8;
        const logoWidth = 120;
        const logoHeight = 120;
        const padding = 20;
        ctx.drawImage(logo, padding, canvas.height - logoHeight - padding, logoWidth, logoHeight);

        ctx.fillStyle = "hsla(var(--primary-foreground) / 0.8)";
        ctx.font = "24px 'PT Sans', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("Anubis Dog AI", padding + logoWidth + 10, canvas.height - (logoHeight / 2) - padding);
        ctx.globalAlpha = 1.0;

        const link = document.createElement("a");
        link.download = `$ANDO_${downloadCount}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setDownloadCount(prevCount => prevCount + 1);
      };
      logo.onerror = () => {
         // Fallback to just text if logo fails
        ctx.drawImage(img, 0, 0, 1080, 1080);
        ctx.fillStyle = "hsla(var(--primary-foreground) / 0.7)";
        ctx.font = "bold 24px 'PT Sans', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("Anubis Dog AI", 1060, 1060);
        const link = document.createElement("a");
        link.download = `$ANDO_${downloadCount}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setDownloadCount(prevCount => prevCount + 1);
      }
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline text-primary mb-4">
          Transform Your Profile Picture
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
          Upload your photo, choose a style, and let our AI create a stunning new avatar for you, inspired by ancient Egypt.
        </p>
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-green-500/20">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          100% Free AI • No API Keys Required
        </div>
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

      {(originalImage || generatedImage) && (
        <section id="preview" className="mt-12 md:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start">
            <div className="flex flex-col items-center">
              <h3 className="text-xl md:text-2xl font-headline text-foreground mb-4">Original</h3>
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
             <div className="flex flex-col items-center gap-4">
               <h3 className="text-xl md:text-2xl font-headline text-foreground">Generated</h3>
              <div className="aspect-square w-full max-w-md rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                  {isLoading && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                      <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin text-primary mb-4" />
                      <p className="text-base md:text-lg text-primary font-headline mb-2">
                        {loadingMessage}
                      </p>
                      <p className="text-sm text-muted-foreground text-center px-4">
                        {currentProvider ? `Using ${currentProvider} • ` : ''}Free AI • No API keys required
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
                      <Wand2 className="w-16 h-16 md:w-24 md:h-24 mx-auto text-primary" />
                      <p className="mt-4 text-sm md:text-base">Your AI generated avatar will appear here.</p>
                    </div>
                  )}
              </div>
              {generatedImage && (
                <Button
                  onClick={handleDownload}
                  variant="default"
                  size="lg"
                  className="w-full max-w-md font-bold text-lg py-7"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download (PNG)
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {(originalImage) && (
        <section id="generate" ref={generateSectionRef} className="mt-12 md:mt-16 text-center scroll-mt-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline text-foreground mb-2">Generate Your Avatar</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Select a preset, then click generate to create your masterpiece.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-center text-lg md:text-xl font-headline p-4 transition-all duration-300",
                    "bg-secondary hover:bg-primary/20",
                    selectedStyle === style.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background text-primary" : "text-muted-foreground"
                  )}
                >
                  {style.name}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDirectAI}
                  onChange={(e) => setUseDirectAI(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Use instant processing (faster, works offline)
              </label>
            </div>

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
          </section>
      )}

    </div>
  );
}
