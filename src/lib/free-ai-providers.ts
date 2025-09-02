// Free AI Image Generation Providers (No API Keys Required)

export interface FreeImageGenerationOptions {
  prompt: string;
  userImage?: string;
  style: string;
  width?: number;
  height?: number;
}

export interface FreeImageGenerationResult {
  imageUrl: string;
  prompt: string;
  provider: string;
}

// Hugging Face Inference API (Free Tier - No API Key Required)
export class HuggingFaceFreeProvider {
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';

  async generateImage(options: FreeImageGenerationOptions): Promise<FreeImageGenerationResult> {
    const enhancedPrompt = this.enhancePrompt(options.prompt, options.style);
    
    // Try multiple free models in order of quality
    const models = [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'runwayml/stable-diffusion-v1-5',
      'CompVis/stable-diffusion-v1-4',
    ];

    for (const model of models) {
      try {
        const result = await this.tryModel(model, enhancedPrompt);
        if (result) {
          return {
            imageUrl: result,
            prompt: enhancedPrompt,
            provider: `huggingface-${model.split('/')[1]}`,
          };
        }
      } catch (error) {
        console.log(`Model ${model} failed, trying next...`);
        continue;
      }
    }

    throw new Error('All Hugging Face models failed or are loading');
  }

  private async tryModel(model: string, prompt: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: 20,
            width: 512,
            height: 512,
          },
        }),
      });

      if (response.status === 503) {
        // Model is loading, return null to try next model
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      return null;
    }
  }

  private enhancePrompt(basePrompt: string, style: string): string {
    const styleEnhancements = {
      'Neon Glow': 'neon lighting, glowing effects, vibrant electric colors, cyberpunk aesthetic, fluorescent',
      'Dark Gold': 'golden metallic, dark atmosphere, ancient Egyptian luxury, ornate decorations',
      'Cyberpunk Blue': 'electric blue, futuristic technology, digital matrix, sci-fi lighting',
      'Cosmic Purple': 'cosmic purple, space nebula, mystical starfield, ethereal glow',
    };

    const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || '';
    return `${basePrompt}, ${enhancement}, highly detailed, professional digital art, masterpiece, 8k quality`;
  }
}

// Client-side AI using WebGL/TensorFlow.js (Experimental)
export class ClientSideAIProvider {
  private model: any = null;

  async generateImage(options: FreeImageGenerationOptions): Promise<FreeImageGenerationResult> {
    // This would use TensorFlow.js or WebGL for client-side generation
    // For now, we'll implement an enhanced canvas-based approach with AI-like effects
    
    const enhancedImage = await this.enhanceImageWithFilters(options);
    
    return {
      imageUrl: enhancedImage,
      prompt: options.prompt,
      provider: 'client-side-enhanced',
    };
  }

  private async enhanceImageWithFilters(options: FreeImageGenerationOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!options.userImage) {
        reject(new Error('No user image provided'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = 1024;
        canvas.height = 1024;

        // Draw the original image scaled to fit
        const scale = Math.min(1024 / img.width, 1024 / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (1024 - scaledWidth) / 2;
        const y = (1024 - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Apply AI-like enhancements based on style
        this.applyStyleEnhancements(ctx, options.style, canvas.width, canvas.height);

        // Add Egyptian elements
        this.addEgyptianElements(ctx, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = options.userImage;
    });
  }

  private applyStyleEnhancements(ctx: CanvasRenderingContext2D, style: string, width: number, height: number) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    switch (style) {
      case 'Neon Glow':
        this.applyNeonEffect(data);
        break;
      case 'Dark Gold':
        this.applyGoldEffect(data);
        break;
      case 'Cyberpunk Blue':
        this.applyCyberpunkEffect(data);
        break;
      case 'Cosmic Purple':
        this.applyCosmicEffect(data);
        break;
    }

    ctx.putImageData(imageData, 0, 0);

    // Add glow effects
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.getStyleColor(style);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = this.getStyleColor(style);
    ctx.globalAlpha = 0.1;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
  }

  private applyNeonEffect(data: Uint8ClampedArray) {
    for (let i = 0; i < data.length; i += 4) {
      // Enhance brightness and add neon tint
      data[i] = Math.min(255, data[i] * 1.2 + 30);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.1 + 50); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.3 + 70); // Blue
    }
  }

  private applyGoldEffect(data: Uint8ClampedArray) {
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = Math.min(255, brightness * 1.2 + 40);     // Red (gold)
      data[i + 1] = Math.min(255, brightness * 1.0 + 30); // Green (gold)
      data[i + 2] = Math.min(255, brightness * 0.6);      // Blue (less blue)
    }
  }

  private applyCyberpunkEffect(data: Uint8ClampedArray) {
    for (let i = 0; i < data.length; i += 4) {
      // Enhance blue and reduce other colors
      data[i] = Math.min(255, data[i] * 0.7);           // Red
      data[i + 1] = Math.min(255, data[i + 1] * 0.9 + 20); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.4 + 50); // Blue
    }
  }

  private applyCosmicEffect(data: Uint8ClampedArray) {
    for (let i = 0; i < data.length; i += 4) {
      // Enhance purple tones
      data[i] = Math.min(255, data[i] * 1.1 + 30);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 0.8);  // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.3 + 40); // Blue
    }
  }

  private getStyleColor(style: string): string {
    const colors = {
      'Neon Glow': '#ff00ff',
      'Dark Gold': '#ffd700',
      'Cyberpunk Blue': '#00ffff',
      'Cosmic Purple': '#8a2be2',
    };
    return colors[style as keyof typeof colors] || '#ffffff';
  }

  private addEgyptianElements(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Add geometric Egyptian patterns
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    
    // Draw Egyptian-style border
    const margin = 20;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    
    // Add corner decorations
    this.drawEgyptianCorners(ctx, width, height, margin);
  }

  private drawEgyptianCorners(ctx: CanvasRenderingContext2D, width: number, height: number, margin: number) {
    const cornerSize = 40;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerSize, margin);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + cornerSize);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(margin, height - margin - cornerSize);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + cornerSize, height - margin);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - cornerSize);
    ctx.stroke();
  }
}

// Pollinations.ai - Completely Free API (No Key Required)
export class PollinationsProvider {
  private readonly baseUrl = 'https://image.pollinations.ai/prompt';

  async generateImage(options: FreeImageGenerationOptions): Promise<FreeImageGenerationResult> {
    const enhancedPrompt = this.enhancePrompt(options.prompt, options.style);
    
    // Pollinations.ai provides free image generation via simple URL
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `${this.baseUrl}/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}`;

    // Test if the URL works
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await this.blobToDataURL(blob);
        
        return {
          imageUrl: dataUrl,
          prompt: enhancedPrompt,
          provider: 'pollinations',
        };
      }
    } catch (error) {
      console.error('Pollinations API error:', error);
    }

    throw new Error('Pollinations.ai service unavailable');
  }

  private enhancePrompt(basePrompt: string, style: string): string {
    const styleEnhancements = {
      'Neon Glow': 'neon cyberpunk style, glowing edges, electric colors, futuristic lighting',
      'Dark Gold': 'ancient Egyptian gold, dark mysterious atmosphere, pharaoh luxury, ornate details',
      'Cyberpunk Blue': 'electric blue cyberpunk, digital matrix, futuristic technology, neon blue',
      'Cosmic Purple': 'cosmic space theme, purple nebula, mystical starfield, ethereal glow',
    };

    const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || '';
    return `${basePrompt} in ${enhancement}, highly detailed digital art, professional quality, centered composition`;
  }

  private async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Free AI Provider Factory
export class FreeAIProviderFactory {
  static async createProvider(providerName: string = 'auto') {
    switch (providerName.toLowerCase()) {
      case 'huggingface':
        return new HuggingFaceFreeProvider();
      case 'pollinations':
        return new PollinationsProvider();
      case 'client':
        return new ClientSideAIProvider();
      case 'auto':
      default:
        // Try providers in order of quality/reliability
        return await this.getBestAvailableProvider();
    }
  }

  static async getBestAvailableProvider() {
    // Test Pollinations.ai first (usually most reliable free option)
    try {
      const testUrl = 'https://image.pollinations.ai/prompt/test?width=64&height=64';
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        return new PollinationsProvider();
      }
    } catch (error) {
      console.log('Pollinations not available, trying Hugging Face');
    }

    // Fallback to Hugging Face
    try {
      return new HuggingFaceFreeProvider();
    } catch (error) {
      console.log('Hugging Face not available, using client-side');
    }

    // Final fallback to client-side processing
    return new ClientSideAIProvider();
  }

  static getAvailableProviders(): string[] {
    return ['pollinations', 'huggingface', 'client'];
  }
}

// Enhanced Canvas-based AI-like Processing
export class AdvancedCanvasProcessor {
  static async processImage(
    userImage: string, 
    style: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = 1024;
        canvas.height = 1024;

        // Step 1: Draw base image
        onProgress?.(20);
        const scale = Math.min(1024 / img.width, 1024 / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (1024 - scaledWidth) / 2;
        const y = (1024 - scaledHeight) / 2;
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Step 2: Apply AI-like filters
        onProgress?.(40);
        this.applyAILikeFilters(ctx, style, canvas.width, canvas.height);

        // Step 3: Add Egyptian elements
        onProgress?.(60);
        this.addEgyptianOverlays(ctx, canvas.width, canvas.height);

        // Step 4: Final enhancements
        onProgress?.(80);
        this.addFinalEnhancements(ctx, style, canvas.width, canvas.height);

        onProgress?.(100);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = userImage;
    });
  }

  private static applyAILikeFilters(ctx: CanvasRenderingContext2D, style: string, width: number, height: number) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Apply style-specific color transformations
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const brightness = (r + g + b) / 3;

      switch (style) {
        case 'Neon Glow':
          data[i] = Math.min(255, r * 1.2 + Math.sin(i * 0.01) * 30);
          data[i + 1] = Math.min(255, g * 1.1 + 40);
          data[i + 2] = Math.min(255, b * 1.4 + 60);
          break;
        case 'Dark Gold':
          data[i] = Math.min(255, brightness * 1.3 + 50);
          data[i + 1] = Math.min(255, brightness * 1.1 + 30);
          data[i + 2] = Math.min(255, brightness * 0.6 + 10);
          break;
        case 'Cyberpunk Blue':
          data[i] = Math.min(255, r * 0.7 + 20);
          data[i + 1] = Math.min(255, g * 0.9 + 30);
          data[i + 2] = Math.min(255, b * 1.5 + 70);
          break;
        case 'Cosmic Purple':
          data[i] = Math.min(255, r * 1.2 + 40);
          data[i + 1] = Math.min(255, g * 0.8 + 10);
          data[i + 2] = Math.min(255, b * 1.4 + 60);
          break;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private static addEgyptianOverlays(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Create Egyptian-style frame
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Add hieroglyphic-style patterns
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 4;
    
    // Top border pattern
    for (let x = 60; x < width - 60; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x + 10, 40);
      ctx.lineTo(x + 20, 50);
      ctx.stroke();
    }

    // Side patterns
    for (let y = 100; y < height - 100; y += 40) {
      ctx.beginPath();
      ctx.arc(60, y, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(width - 60, y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private static addFinalEnhancements(ctx: CanvasRenderingContext2D, style: string, width: number, height: number) {
    // Add subtle gradient overlay
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add style-specific final touches
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    
    switch (style) {
      case 'Neon Glow':
        ctx.fillStyle = '#ff00ff';
        break;
      case 'Dark Gold':
        ctx.fillStyle = '#ffd700';
        break;
      case 'Cyberpunk Blue':
        ctx.fillStyle = '#00ffff';
        break;
      case 'Cosmic Purple':
        ctx.fillStyle = '#8a2be2';
        break;
    }
    
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  }
}