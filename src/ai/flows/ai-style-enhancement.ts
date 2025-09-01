'use server';
/**
 * @fileOverview AI style enhancement flow that stylizes an avatar using image-to-image diffusion.
 *
 * - aiStyleEnhancement - A function that applies AI style enhancement to an avatar.
 * - AIStyleEnhancementInput - The input type for the ai-style-enhancement function.
 * - AIStyleEnhancementOutput - The return type for the ai-style-enhancement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIStyleEnhancementInputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      "The data URI of the avatar image to be stylized, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  style: z.string().describe("The visual style to apply to the avatar."),
});
export type AIStyleEnhancementInput = z.infer<typeof AIStyleEnhancementInputSchema>;

const AIStyleEnhancementOutputSchema = z.object({
  stylizedAvatarDataUri: z
    .string()
    .describe(
      "The data URI of the stylized avatar image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AIStyleEnhancementOutput = z.infer<typeof AIStyleEnhancementOutputSchema>;

export async function aiStyleEnhancement(input: AIStyleEnhancementInput): Promise<AIStyleEnhancementOutput> {
  return aiStyleEnhancementFlow(input);
}

const aiStyleEnhancementFlow = ai.defineFlow(
  {
    name: 'aiStyleEnhancementFlow',
    inputSchema: AIStyleEnhancementInputSchema,
    outputSchema: AIStyleEnhancementOutputSchema,
  },
  async (input) => {
    // Step 1: Analyze the user's photo to get a description.
    const analysisResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { media: { url: input.avatarDataUri } },
        { text: "Describe the person in this photo in a short, simple, descriptive phrase for an image generation AI. Focus on key facial features, hair, and expression. For example: 'A smiling woman with long brown hair' or 'A man with a beard and glasses'." },
      ],
    });

    const facialDescription = analysisResponse.text;

    if (!facialDescription) {
      throw new Error('The AI failed to analyze the uploaded image.');
    }

    // Step 2: Generate a new image based on the description and style.
    const stylePrompt = `Generate an avatar of: ${facialDescription}. The person is wearing a classic blue and gold striped pharaoh's headdress and an ornate Egyptian collar. The style of the image should be: ${input.style}.`;

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: stylePrompt,
    });
    
    if (!media?.url) {
      throw new Error('The AI failed to generate an image. The response did not contain image data.');
    }
    
    return {stylizedAvatarDataUri: media.url};
  }
);
