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
      "The data URI of the avatar image to be stylized, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.avatarDataUri } },
        { text: `Take the provided image of a person. Do not change their face, eyes, or expression. Keep the original face. Add a classic blue and gold striped pharaoh's headdress (Nemes) with a cobra (Uraeus) on the front. Also, add a wide, ornate Egyptian collar (a Usekh or Wesekh) around their neck, made of gold and inlaid with blue and turquoise gemstones. Apply the following style: ${input.style}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('The AI failed to generate an image. The response did not contain image data.');
    }

    return {stylizedAvatarDataUri: media.url};
  }
);
