// AI Image Generation Providers
export interface ImageGenerationOptions {
  prompt: string;
  userImage?: string;
  style: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  provider: string;
}

// OpenAI DALL-E 3 Provider
export class OpenAIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: this.enhancePrompt(options.prompt, options.style),
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      imageUrl: data.data[0].url,
      prompt: options.prompt,
      provider: 'openai',
    };
  }

  private enhancePrompt(basePrompt: string, style: string): string {
    const styleEnhancements = {
      'Neon Glow': 'with vibrant neon colors, glowing effects, electric atmosphere, cyberpunk lighting',
      'Dark Gold': 'with rich golden tones, dark shadows, luxurious metallic textures, ancient Egyptian opulence',
      'Cyberpunk Blue': 'with electric blue accents, futuristic elements, digital matrix effects, sci-fi atmosphere',
      'Cosmic Purple': 'with deep purple cosmic themes, space nebula backgrounds, mystical starry effects',
    };

    const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || '';
    return `${basePrompt} ${enhancement}. High quality, detailed digital art, professional avatar, 1:1 aspect ratio`;
  }
}

// Stability AI Provider
export class StabilityAIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const formData = new FormData();
    formData.append('text_prompts[0][text]', this.enhancePrompt(options.prompt, options.style));
    formData.append('text_prompts[0][weight]', '1');
    formData.append('cfg_scale', '7');
    formData.append('height', '1024');
    formData.append('width', '1024');
    formData.append('samples', '1');
    formData.append('steps', '30');

    if (options.userImage) {
      // Convert base64 to blob for image-to-image generation
      const base64Response = await fetch(options.userImage);
      const blob = await base64Response.blob();
      formData.append('init_image', blob);
      formData.append('init_image_mode', 'IMAGE_STRENGTH');
      formData.append('image_strength', '0.35');
    }

    const endpoint = options.userImage 
      ? 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image'
      : 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stability AI error: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const base64Image = data.artifacts[0].base64;
    
    return {
      imageUrl: `data:image/png;base64,${base64Image}`,
      prompt: options.prompt,
      provider: 'stability',
    };
  }

  private enhancePrompt(basePrompt: string, style: string): string {
    const styleKeywords = {
      'Neon Glow': 'neon, glowing, vibrant colors, electric, cyberpunk',
      'Dark Gold': 'gold, metallic, dark, luxurious, ancient Egyptian',
      'Cyberpunk Blue': 'blue, electric, futuristic, digital, sci-fi',
      'Cosmic Purple': 'purple, cosmic, space, nebula, mystical',
    };

    const keywords = styleKeywords[style as keyof typeof styleKeywords] || '';
    return `${basePrompt}, ${keywords}, high quality, detailed, professional avatar`;
  }
}

// Replicate Provider (for various models)
export class ReplicateProvider {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    // Using Stable Diffusion XL model on Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt: this.enhancePrompt(options.prompt, options.style),
          width: 1024,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          ...(options.userImage && { 
            image: options.userImage,
            prompt_strength: 0.8 
          }),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Replicate API error: ${error.detail || 'Unknown error'}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });
      result = await statusResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error(`Replicate generation failed: ${result.error}`);
    }

    return {
      imageUrl: result.output[0],
      prompt: options.prompt,
      provider: 'replicate',
    };
  }

  private enhancePrompt(basePrompt: string, style: string): string {
    const stylePrompts = {
      'Neon Glow': 'neon lighting, glowing effects, vibrant colors, cyberpunk aesthetic',
      'Dark Gold': 'golden tones, dark atmosphere, luxurious, ancient Egyptian style',
      'Cyberpunk Blue': 'electric blue, futuristic, digital art, sci-fi aesthetic',
      'Cosmic Purple': 'cosmic purple, space theme, nebula background, mystical',
    };

    const enhancement = stylePrompts[style as keyof typeof stylePrompts] || '';
    return `${basePrompt}, ${enhancement}, highly detailed, professional quality, digital art`;
  }
}

// AI Provider Factory
export class AIProviderFactory {
  static createProvider(providerName: string, apiKey: string) {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'stability':
        return new StabilityAIProvider(apiKey);
      case 'replicate':
        return new ReplicateProvider(apiKey);
      default:
        throw new Error(`Unknown AI provider: ${providerName}`);
    }
  }

  static getAvailableProviders(): string[] {
    const providers = [];
    if (process.env.OPENAI_API_KEY) providers.push('openai');
    if (process.env.STABILITY_API_KEY) providers.push('stability');
    if (process.env.REPLICATE_API_TOKEN) providers.push('replicate');
    return providers;
  }

  static getBestAvailableProvider(): string {
    const available = this.getAvailableProviders();
    
    // Priority order: OpenAI (best quality) -> Stability AI -> Replicate
    if (available.includes('openai')) return 'openai';
    if (available.includes('stability')) return 'stability';
    if (available.includes('replicate')) return 'replicate';
    
    throw new Error('No AI providers configured. Please add API keys to environment variables.');
  }
}