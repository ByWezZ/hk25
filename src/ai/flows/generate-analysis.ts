
'use server';

/**
 * @fileOverview This file defines the generateAnalysis flow, which takes a legal strategy as input and returns an AI-powered analysis, including the Adversarial Playbook.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {generateAdversarialPlaybook} from './generate-adversarial-playbook';
import { ThreePartAnalysisSchema, AnalysisDashboardSchema, GenerateAnalysisInputSchema } from '@/lib/types';
import type { Analysis } from '@/lib/types';

export type GenerateAnalysisInput = z.infer<typeof GenerateAnalysisInputSchema>;
export type GenerateAnalysisOutput = { analysisDashboard: Analysis };

export async function generateAnalysis(input: GenerateAnalysisInput): Promise<GenerateAnalysisOutput> {
  return generateAnalysisFlow(input);
}

const threePartAnalysisPrompt = ai.definePrompt({
  name: 'threePartAnalysisPrompt',
  input: {schema: GenerateAnalysisInputSchema},
  output: {schema: ThreePartAnalysisSchema},
  prompt: `You are a world-class AI legal analyst with deep expertise in international arbitration. Your task is to provide an exceptionally detailed, multi-faceted analysis of a legal strategy. Be rigorous, insightful, and think several steps ahead.

  Legal Strategy to Analyze:
  {{{legalStrategy}}}

  Produce a structured analysis in JSON format with three distinct parts:

  1.  **Advocate's Brief:**
      *   Formulate the most compelling and sophisticated arguments for the provided strategy. Go beyond the surface level.
      *   For each argument, provide at least two supporting case citations.
      *   **Crucially, for each citation, provide a detailed 'relevance' explanation:** Detail which part of the cited case is relevant, how it directly supports the specific argument, and how it links to the user's current case facts.

  2.  **Adversary's Rebuttal:**
      *   For each argument in the Advocate's Brief, identify every significant weakness.
      *   For each identified weakness, provide:
          *   A 'weakness' description.
          *   A 'vulnerabilityScore' from 1 (minor) to 10 (critical).
          *   A detailed 'rationale' justifying the score.

  3.  **Arbiter's Synthesis:**
      *   Identify the absolute 'keyVulnerabilities' that are most likely to be dispositive.
      *   Provide a 'refinedStrategy' with concrete recommendations to mitigate these vulnerabilities.
      *   Offer a 'predictiveAnalysis' of the case outcome and your confidence level.
  `,
});

const generateAnalysisFlow = ai.defineFlow(
  {
    name: 'generateAnalysisFlow',
    inputSchema: GenerateAnalysisInputSchema,
    outputSchema: z.object({ analysisDashboard: AnalysisDashboardSchema }),
  },
  async input => {
    // Run the three-part analysis and the playbook generation in parallel
    const [threePartAnalysisResult, adversarialPlaybookResult] = await Promise.all([
      threePartAnalysisPrompt(input),
      generateAdversarialPlaybook(input),
    ]);

    if (!threePartAnalysisResult.output || !adversarialPlaybookResult.adversarialPlaybook) {
      throw new Error('Failed to generate one or more parts of the analysis.');
    }

    return {
      analysisDashboard: {
        ...threePartAnalysisResult.output,
        adversarialPlaybook: adversarialPlaybookResult.adversarialPlaybook,
      },
    };
  }
);
