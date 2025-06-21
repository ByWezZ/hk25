'use server';
/**
 * @fileOverview A legal case summarization AI agent.
 *
 * - generateLegalSummary - A function that handles the legal summarization process.
 * - GenerateLegalSummaryInput - The input type for the generateLegalSummary function.
 * - GenerateLegalSummaryOutput - The return type for the generateLegalSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLegalSummaryInputSchema = z.object({
  caseName: z.string().describe('The name of the legal case to summarize.'),
});
export type GenerateLegalSummaryInput = z.infer<typeof GenerateLegalSummaryInputSchema>;

const GenerateLegalSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the legal case, including its key arguments and reasoning.'),
});
export type GenerateLegalSummaryOutput = z.infer<typeof GenerateLegalSummaryOutputSchema>;

export async function generateLegalSummary(input: GenerateLegalSummaryInput): Promise<GenerateLegalSummaryOutput> {
  return generateLegalSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLegalSummaryPrompt',
  input: {schema: GenerateLegalSummaryInputSchema},
  output: {schema: GenerateLegalSummaryOutputSchema},
  prompt: `You are an expert legal assistant. Please provide a concise summary of the legal case named "{{caseName}}", including its key arguments and reasoning.  Focus on the elements that would be most relevant to a lawyer assessing its relevance to a current case.`,
});

const generateLegalSummaryFlow = ai.defineFlow(
  {
    name: 'generateLegalSummaryFlow',
    inputSchema: GenerateLegalSummaryInputSchema,
    outputSchema: GenerateLegalSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
