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
  sourceText: z
    .string()
    .describe('The raw text chunk from the source document that this summary is based on. This provides a verifiable source of truth.'),
});
export type GenerateLegalSummaryOutput = z.infer<typeof GenerateLegalSummaryOutputSchema>;

export async function generateLegalSummary(input: GenerateLegalSummaryInput): Promise<GenerateLegalSummaryOutput> {
  return generateLegalSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLegalSummaryPrompt',
  input: {schema: GenerateLegalSummaryInputSchema},
  output: {schema: GenerateLegalSummaryOutputSchema},
  prompt: `You are an expert legal assistant. For the case "{{caseName}}", provide two things:
1.  A concise summary of the case, including its key arguments and reasoning. Focus on elements relevant to a lawyer assessing its relevance to a current case.
2.  The raw source text that was used for the summary. For this demonstration, please invent a plausible, well-formatted paragraph of legal text that looks like it came from a legal document or case file. This is for the "Source of Truth" feature.
`,
});

const generateLegalSummaryFlow = ai.defineFlow(
  {
    name: 'generateLegalSummaryFlow',
    inputSchema: GenerateLegalSummaryInputSchema,
    outputSchema: GenerateLegalSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate legal summary.');
    }
    return {
      summary: output.summary,
      sourceText: output.sourceText || 'Source text not available for this mock-up.',
    };
  }
);
