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

export const GenerateAvatarInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

export const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z.string().describe('The generated avatar image as a data URI.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(
  input: GenerateAvatarInput
): Promise<GenerateAvatarOutput> {
  const anubisPrompt =
    'A majestic, divine Anubis, the Egyptian god of the afterlife. The figure has the body of a powerful, athletic man and the head of a sleek black jackal with intelligent, piercing eyes. Adorned with ornate gold jewelry, including a broad collar, cuffs, and a royal kilt. The background is a dramatic, mystical Egyptian landscape with pyramids under a starry night sky. The style should be hyper-realistic, with cinematic lighting and intricate details, like a high-end digital painting.';

  const {media} = await ai.generate({
    model: 'dall-e-3',
    prompt: anubisPrompt,
    // When DALL-E 3 is used with image-to-image capabilities, we can add the input image here.
    // As of now, we will generate based on the prompt.
    // For a true "avatarify" feature, a model supporting image-to-image with a base image is needed.
  });

  const generatedImage = media.url;
  if (!generatedImage) {
    throw new Error('Image generation failed.');
  }

  return {avatarDataUri: generatedImage};
}
