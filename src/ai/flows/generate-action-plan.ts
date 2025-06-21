'use server';

/**
 * @fileOverview An AI agent for generating an actionable checklist of tasks based on the AI analysis.
 *
 * - generateActionPlan - A function that generates the action plan.
 * - GenerateActionPlanInput - The input type for the generateActionPlan function.
 * - GenerateActionPlanOutput - The return type for the generateActionPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActionPlanInputSchema = z.object({
  analysisResults: z
    .string()
    .describe("The AI analysis results, containing the Advocate's Brief, Adversary's Rebuttal, and Arbiter's Synthesis."),
});
export type GenerateActionPlanInput = z.infer<typeof GenerateActionPlanInputSchema>;

const GenerateActionPlanOutputSchema = z.object({
  actionItems: z
    .array(z.string())
    .describe('A list of actionable tasks derived from the AI analysis.'),
});
export type GenerateActionPlanOutput = z.infer<typeof GenerateActionPlanOutputSchema>;

export async function generateActionPlan(input: GenerateActionPlanInput): Promise<GenerateActionPlanOutput> {
  return generateActionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActionPlanPrompt',
  input: {schema: GenerateActionPlanInputSchema},
  output: {schema: GenerateActionPlanOutputSchema},
  prompt: `You are an AI assistant designed to generate an actionable checklist of tasks for lawyers based on AI analysis of a legal strategy.

  Given the AI analysis results, extract key vulnerabilities and recommendations to create a list of actionable tasks for the lawyer.
  Each task should be clear, concise, and directly related to addressing the identified weaknesses and refining the legal strategy.

  Analysis Results: {{{analysisResults}}}
  \nOutput the actionable checklist in a numbered list format.`,
});

const generateActionPlanFlow = ai.defineFlow(
  {
    name: 'generateActionPlanFlow',
    inputSchema: GenerateActionPlanInputSchema,
    outputSchema: GenerateActionPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
