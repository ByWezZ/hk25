'use server';
/**
 * @fileOverview Defines the Genkit flow for generating an "Adversarial Playbook".
 * This includes potential counter-arguments, rebuttals, counter-rebuttals, and analysis of opposing counsel.
 *
 * - generateAdversarialPlaybook: The main function to trigger the playbook generation.
 * - GenerateAdversarialPlaybookInput: Input type for the flow.
 * - GenerateAdversarialPlaybookOutput: Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type {AdversarialPlaybook} from '@/lib/types';
import {AdversarialPlaybookSchema} from '@/lib/types';

const GenerateAdversarialPlaybookInputSchema = z.object({
  legalStrategy: z.string().describe('The full legal strategy, including case facts and arguments, for which to generate a playbook.'),
});
export type GenerateAdversarialPlaybookInput = z.infer<typeof GenerateAdversarialPlaybookInputSchema>;

const GenerateAdversarialPlaybookOutputSchema = z.object({
  adversarialPlaybook: AdversarialPlaybookSchema,
});
export type GenerateAdversarialPlaybookOutput = z.infer<typeof GenerateAdversarialPlaybookOutputSchema>;

export async function generateAdversarialPlaybook(input: GenerateAdversarialPlaybookInput): Promise<GenerateAdversarialPlaybookOutput> {
  return generateAdversarialPlaybookFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdversarialPlaybookPrompt',
  input: {schema: GenerateAdversarialPlaybookInputSchema},
  output: {schema: GenerateAdversarialPlaybookOutputSchema},
  prompt: `You are a master legal strategist with expertise in international arbitration, thinking multiple moves ahead. Your task is to create an exceptionally deep "Adversarial Playbook" based on the provided legal strategy.

Legal Strategy Document:
{{{legalStrategy}}}

Based on the document, generate the following:
1.  **Potential Counter-Arguments:** Create an exhaustive list of every potential argument the opposing side could realistically make. Be creative and thorough.
2.  **Rebuttals & Counter-Rebuttals:** For each counter-argument:
    a.  Provide a set of strong, well-supported **rebuttals** our team can use.
    b.  **Crucially, for each rebuttal, anticipate the next move.** Generate a list of likely **potentialCounterRebuttals** the opposing counsel might use in response to our rebuttal. For each, assess its strength as "High", "Medium", or "Low".
3.  **Opponent Counsel Analysis:** Provide a brief analysis of what the opposing counsel's strategic patterns might be, based on the nature of the case. Frame this as a general strategic forecast.
`,
});

const generateAdversarialPlaybookFlow = ai.defineFlow(
  {
    name: 'generateAdversarialPlaybookFlow',
    inputSchema: GenerateAdversarialPlaybookInputSchema,
    outputSchema: GenerateAdversarialPlaybookOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
