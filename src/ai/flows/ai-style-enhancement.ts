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

const descriptionPrompt = ai.definePrompt({
  name: 'getFaceDescriptionPrompt',
  input: {
    schema: z.object({
      avatarDataUri: z.string(),
    }),
  },
  prompt: `Describe the face of the person in this image in detail. Focus on facial features, expression, hair, and any accessories. Do not mention their body or clothing.

Image: {{media url=avatarDataUri}}`,
  model: 'googleai/gemini-1.5-flash',
});


const aiStyleEnhancementFlow = ai.defineFlow(
  {
    name: 'aiStyleEnhancementFlow',
    inputSchema: AIStyleEnhancementInputSchema,
    outputSchema: AIStyleEnhancementOutputSchema,
  },
  async input => {
    // Step 1: Get a description of the face from the input image.
    const {output: faceDescription} = await descriptionPrompt(input);
    if (!faceDescription) {
      throw new Error('Could not get a description of the face from the image.');
    }

    // Step 2: Use the description to generate a new image.
    const stylePrompt = `A photorealistic avatar of a person.
    
    The person's face is described as: ${faceDescription}.
    
    The person is wearing a classic blue and gold striped pharaoh's headdress (Nemes) with a cobra (Uraeus) on the front. They also have a wide, ornate Egyptian collar (a Usekh or Wesekh) around their neck, made of gold and inlaid with blue and turquoise gemstones.
    
    The style of the image should be: ${input.style}.`;

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: stylePrompt
    });

    if (!media?.url) {
      throw new Error('The AI failed to generate an image. The response did not contain image data.');
    }

    return {stylizedAvatarDataUri: media.url};
  }
);
