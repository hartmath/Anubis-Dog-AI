import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';

export const ai = genkit({
  plugins: [openAI(), googleAI()],
});
