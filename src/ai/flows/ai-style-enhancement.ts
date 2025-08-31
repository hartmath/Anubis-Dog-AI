'use server';
/**
 * @fileOverview AI style enhancement flow that stylizes an avatar using image-to-image diffusion.
 *
 * - aiStyleEnhancement - A function that applies AI style enhancement to an avatar.
 * - AIStyleEnhancementInput - The input type for the aiStyleEnhancement function.
 * - AIStyleEnhancementOutput - The return type for the aiStyleEnhancement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIStyleEnhancementInputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      'The data URI of the avatar image to be stylized, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* e.g., "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w9WwAgYGTQQAGmYGBgYJCEAAVS8nBwBQMAAAAABJRU5ErkJggg==" */
    ),
});
export type AIStyleEnhancementInput = z.infer<typeof AIStyleEnhancementInputSchema>;

const AIStyleEnhancementOutputSchema = z.object({
  stylizedAvatarDataUri: z
    .string()
    .describe(
      'The data URI of the stylized avatar image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* e.g., "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w9WwAgYGTQQAGmYGBgYJCEAAVS8nBwBQMAAAAABJRU5ErkJggg==" */
    ),
});
export type AIStyleEnhancementOutput = z.infer<typeof AIStyleEnhancementOutputSchema>;

export async function aiStyleEnhancement(input: AIStyleEnhancementInput): Promise<AIStyleEnhancementOutput> {
  return aiStyleEnhancementFlow(input);
}

const AIStyleEnhancementPromptInputSchema = z.object({
  avatarDataUri: AIStyleEnhancementInputSchema.shape.avatarDataUri,
  contentType: z.string().describe('The content type of the avatar image.'),
});

const aiStyleEnhancementPrompt = ai.definePrompt({
  name: 'aiStyleEnhancementPrompt',
  input: {schema: AIStyleEnhancementPromptInputSchema},
  output: {schema: AIStyleEnhancementOutputSchema},
  prompt: [
    {media: {url: '{{{avatarDataUri}}}', contentType: '{{{contentType}}}'}},
    {
      text: `A stylized portrait of a person wearing an ancient Egyptian Pharaoh headdress, futuristic Anubis aesthetic, glowing edges, golden and blue details, highly detailed, digital art, 4K, trending on ArtStation

Negative Prompt:

blurry, distorted, cropped face, broken headdress, low quality, artifacts, watermark`,
    },
  ],
  model: 'googleai/gemini-2.0-flash-preview-image-generation',
  config: {
    responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
  },
});

const aiStyleEnhancementFlow = ai.defineFlow(
  {
    name: 'aiStyleEnhancementFlow',
    inputSchema: AIStyleEnhancementInputSchema,
    outputSchema: AIStyleEnhancementOutputSchema,
  },
  async input => {
    const contentType = input.avatarDataUri.match(/data:(.*);base64,/)?.[1];
    if (!contentType) {
      throw new Error('Invalid data URI: content type not found.');
    }
    const {media} = await aiStyleEnhancementPrompt({
      ...input,
      contentType,
    });
    return {stylizedAvatarDataUri: media!.url!};
  }
);
