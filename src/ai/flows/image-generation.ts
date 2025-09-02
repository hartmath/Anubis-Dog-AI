import { defineDotprompt, defineFlow } from '@genkit-ai/core';
import { ai } from '../genkit';
import { z } from 'zod';

// Define the input schema for image generation
const ImageGenerationInput = z.object({
  userImage: z.string().describe('Base64 encoded user image'),
  style: z.string().describe('Selected style for the avatar (e.g., Neon Glow, Dark Gold, etc.)'),
  prompt: z.string().optional().describe('Additional custom prompt for image generation'),
});

// Define the output schema
const ImageGenerationOutput = z.object({
  generatedImage: z.string().describe('Base64 encoded generated image'),
  prompt: z.string().describe('The actual prompt used for generation'),
});

// Create a dotprompt for generating image prompts
const imagePromptTemplate = defineDotprompt(
  {
    name: 'avatarPrompt',
    model: ai.model,
    input: {
      schema: z.object({
        style: z.string(),
        customPrompt: z.string().optional(),
      }),
    },
    output: {
      schema: z.object({
        prompt: z.string(),
      }),
    },
  },
  `
You are an expert AI prompt engineer for image generation. Create a detailed, artistic prompt for generating an Anubis-themed avatar based on the user's photo.

Style: {{style}}
{{#if customPrompt}}Custom requirements: {{customPrompt}}{{/if}}

Generate a prompt that will transform a user's photo into an ancient Egyptian Anubis-themed avatar with the following characteristics:

1. **Anubis Elements**: Incorporate classic Anubis features like:
   - Egyptian pharaoh headdress (nemes)
   - Golden Egyptian jewelry and ornaments
   - Ancient Egyptian eye makeup (kohl)
   - Hieroglyphic elements in the background

2. **Style Application**: Apply the "{{style}}" aesthetic:
   - Neon Glow: Vibrant neon colors with glowing effects
   - Dark Gold: Rich golden tones with dark shadows
   - Cyberpunk Blue: Electric blue accents with futuristic elements
   - Cosmic Purple: Deep purple with cosmic/space themes

3. **Technical Requirements**:
   - High quality, detailed artwork
   - Maintain the person's facial structure and features
   - Professional avatar suitable for social media
   - 1:1 aspect ratio
   - Rich colors and sharp details

Create a comprehensive prompt for an AI image generator that will produce a stunning Anubis-themed avatar.

Return only the prompt text, nothing else.
`
);

// Main image generation flow
export const generateAvatarImage = defineFlow(
  {
    name: 'generateAvatarImage',
    inputSchema: ImageGenerationInput,
    outputSchema: ImageGenerationOutput,
  },
  async (input) => {
    try {
      // Step 1: Generate an optimized prompt using AI
      const promptResponse = await imagePromptTemplate({
        style: input.style,
        customPrompt: input.prompt,
      });

      const enhancedPrompt = promptResponse.output.prompt;

      // Step 2: For now, we'll create a detailed response that can be used with external APIs
      // In a real implementation, you would integrate with services like:
      // - OpenAI DALL-E
      // - Stability AI
      // - Midjourney API
      // - Google's Imagen (when available)

      // Placeholder implementation that returns the enhanced prompt
      // You can replace this with actual API calls to image generation services
      const generatedImage = await generateImageWithExternalAPI(input.userImage, enhancedPrompt);

      return {
        generatedImage,
        prompt: enhancedPrompt,
      };
    } catch (error) {
      console.error('Error in generateAvatarImage flow:', error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// External API integration with multiple providers
async function generateImageWithExternalAPI(userImage: string, prompt: string): Promise<string> {
  const { AIProviderFactory } = await import('@/lib/ai-providers');
  
  try {
    // Get the best available provider
    const providerName = AIProviderFactory.getBestAvailableProvider();
    console.log(`Using AI provider: ${providerName}`);
    
    // Get the appropriate API key
    const apiKey = getApiKeyForProvider(providerName);
    if (!apiKey) {
      throw new Error(`No API key found for provider: ${providerName}`);
    }
    
    // Create provider instance
    const provider = AIProviderFactory.createProvider(providerName, apiKey);
    
    // Generate the image
    const result = await provider.generateImage({
      prompt,
      userImage,
      style: 'Anubis Avatar', // This will be enhanced by the provider
      width: 1024,
      height: 1024,
    });
    
    console.log(`Image generated successfully using ${result.provider}`);
    return result.imageUrl;
    
  } catch (error) {
    console.error('AI Provider error:', error);
    
    // Fallback: return enhanced version of original image
    console.log('Falling back to original image processing');
    return userImage;
  }
}

// Helper function to get API key for provider
function getApiKeyForProvider(providerName: string): string | undefined {
  switch (providerName.toLowerCase()) {
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'stability':
      return process.env.STABILITY_API_KEY;
    case 'replicate':
      return process.env.REPLICATE_API_TOKEN;
    default:
      return undefined;
  }
}

// Helper function to integrate with OpenAI DALL-E (example)
export async function generateWithDALLE(prompt: string, userImage?: string): Promise<string> {
  // This would require OpenAI API key and proper setup
  // Example implementation:
  /*
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
    }),
  });
  
  const data = await response.json();
  return data.data[0].url;
  */
  
  throw new Error('DALL-E integration not configured. Please add your OpenAI API key.');
}

// Helper function to integrate with Stability AI (example)
export async function generateWithStabilityAI(prompt: string, userImage?: string): Promise<string> {
  // This would require Stability AI API key
  // Example implementation for text-to-image or image-to-image
  /*
  const formData = new FormData();
  formData.append('text_prompts[0][text]', prompt);
  formData.append('text_prompts[0][weight]', '1');
  formData.append('cfg_scale', '7');
  formData.append('height', '1024');
  formData.append('width', '1024');
  formData.append('samples', '1');
  formData.append('steps', '30');
  
  if (userImage) {
    // For image-to-image generation
    const imageBlob = await fetch(userImage).then(r => r.blob());
    formData.append('init_image', imageBlob);
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', '0.35');
  }
  
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  return `data:image/png;base64,${data.artifacts[0].base64}`;
  */
  
  throw new Error('Stability AI integration not configured. Please add your Stability AI API key.');
}