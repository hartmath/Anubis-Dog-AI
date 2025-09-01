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
    let stylePrompt = `The final image should be a realistic photo.`;
    switch(input.style) {
      case "Neon Glow":
        stylePrompt = `Apply a vibrant, glowing neon aesthetic to the entire image. The headdress and jewelry should pulse with electric blue and hot pink light, casting colorful reflections on the person's face. The background should be dark and moody to make the neon colors pop.`;
        break;
      case "Dark Gold":
        stylePrompt = `Transform the image with a dark, luxurious gold theme. The headdress and jewelry should be made of ancient, burnished gold with intricate details. The lighting should be dramatic, with deep shadows and gleaming golden highlights. The overall mood should be mysterious and regal.`;
        break;
      case "Cyberpunk Blue":
        stylePrompt = `Give the image a futuristic, cyberpunk look with a dominant blue color palette. The headdress and collar should appear holographic or made of advanced, glowing materials. Add subtle cybernetic details to the background or accessories. The lighting should be reminiscent of a neon-lit city at night.`;
        break;
      case "Cosmic Purple":
        stylePrompt = `Infuse the image with a cosmic, ethereal purple vibe. The headdress and jewelry should look like they are crafted from nebulas and stars, with swirling galaxies and glittering stardust. The background should be a deep space scene. The person should look like a celestial being.`;
        break;
    }


    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Take the provided image of a person. Do not change their face, eyes, or expression. Keep the original face. Add a classic blue and gold striped pharaoh's headdress (Nemes) with a cobra (Uraeus) on the front. Also, add a wide, ornate Egyptian collar (a Usekh or Wesekh) around their neck, made of gold and inlaid with blue and turquoise gemstones. Apply the following style: ${stylePrompt}`,
      input: [
        { media: { url: input.avatarDataUri } }
      ],
    });

    if (!media?.url) {
      throw new Error('The AI failed to generate an image.');
    }

    return {stylizedAvatarDataUri: media.url};
  }
);
