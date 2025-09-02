'use server';
/**
 * @fileOverview An AI flow to generate an Anubis-style avatar from a user's photo.
 *
 * - generateAvatar - A function that handles the avatar generation process.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAvatarInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z.string().describe('The generated avatar image as a data URI.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(
  input: GenerateAvatarInput
): Promise<GenerateAvatarOutput> {
  // Validate input
  GenerateAvatarInputSchema.parse(input);

  const anubisPrompt =
    'Transform the person in the provided image into a hyper-realistic, majestic, and divine Anubis, the Egyptian god of the afterlife. The generated figure should have the body of a powerful, athletic man and the head of a sleek black jackal with intelligent, piercing eyes. Adorn them with ornate gold jewelry, including a broad collar, cuffs, and a royal kilt. The background should be a dramatic, mystical Egyptian landscape with pyramids under a starry night sky. The final style should be like a high-end digital painting with cinematic lighting and intricate details.';

  const {media} = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: [
      {media: {url: input.photoDataUri}},
      {text: anubisPrompt},
    ],
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  });

  const generatedImage = media.url;
  if (!generatedImage) {
    throw new Error('Image generation failed.');
  }

  const result = {avatarDataUri: generatedImage};
  
  // Validate output
  GenerateAvatarOutputSchema.parse(result);
  
  return result;
}
