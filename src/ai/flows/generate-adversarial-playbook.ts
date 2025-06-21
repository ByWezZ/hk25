'use server';
/**
 * @fileOverview Defines the Genkit flow for generating an "Adversarial Playbook".
 * This includes potential counter-arguments, rebuttals, and analysis of opposing counsel.
 *
 * - generateAdversarialPlaybook: The main function to trigger the playbook generation.
 * - GenerateAdversarialPlaybookInput: Input type for the flow.
 * - AdversarialPlaybook: Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdversarialPlaybookInputSchema = z.object({
  legalStrategy: z.string().describe('The full legal strategy, including case facts and arguments, for which to generate a playbook.'),
});
export type GenerateAdversarialPlaybookInput = z.infer<typeof GenerateAdversarialPlaybookInputSchema>;

const RebuttalSchema = z.object({
  rebuttal: z.string().describe('A potential rebuttal to the counter-argument.'),
  citations: z.array(z.string()).describe('Case citations to support the rebuttal.'),
});

const CounterArgumentSchema = z.object({
  counterArgument: z.string().describe('A potential counter-argument the opponent might raise.'),
  rebuttals: z.array(RebuttalSchema).describe('Potential rebuttals to this counter-argument.'),
});

export const AdversarialPlaybookSchema = z.object({
  potentialCounterArguments: z.array(CounterArgumentSchema).describe('An exhaustive list of potential counter-arguments.'),
  opponentCounselAnalysis: z.string().describe("An analysis of the opposing counsel's known strategies or patterns, based on public information and past arbitration records. If no information is available, state that."),
});

export const GenerateAdversarialPlaybookOutputSchema = z.object({
  adversarialPlaybook: AdversarialPlaybookSchema,
});
export type AdversarialPlaybook = z.infer<typeof AdversarialPlaybookSchema>;
export type GenerateAdversarialPlaybookOutput = z.infer<typeof GenerateAdversarialPlaybookOutputSchema>;


export async function generateAdversarialPlaybook(input: GenerateAdversarialPlaybookInput): Promise<GenerateAdversarialPlaybookOutput> {
  return generateAdversarialPlaybookFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdversarialPlaybookPrompt',
  input: {schema: GenerateAdversarialPlaybookInputSchema},
  output: {schema: GenerateAdversarialPlaybookOutputSchema},
  prompt: `You are a master legal strategist with expertise in international arbitration. Your task is to create an "Adversarial Playbook" based on the provided legal strategy.
This playbook should anticipate the opponent's moves and prepare robust responses.

Legal Strategy Document:
{{{legalStrategy}}}

Based on the document, generate the following:
1.  **Potential Counter-Arguments:** Create an exhaustive list of every potential argument the opposing side could realistically make.
2.  **Rebuttals:** For each counter-argument, provide a set of strong rebuttals our team can use, supported by relevant case citations where applicable.
3.  **Opponent Counsel Analysis:** Provide a brief analysis of what the opposing counsel's strategic patterns might be, based on the nature of the case. Frame this as a general strategic forecast.
`,
});

const generateAdversarialPlaybookFlow = ai.defineFlow(
  {
    name: 'generateAdversarialPlaybookFlow',
    inputSchema: GenerateAdversarialPlaybookInputSchema,
    outputSchema: GenerateAdversarialPlaybookOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
