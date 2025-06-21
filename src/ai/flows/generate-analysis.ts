'use server';

/**
 * @fileOverview This file defines the generateAnalysis flow, which takes a legal strategy as input and returns an AI-powered analysis.
 *
 * @fileOverview This file defines the generateAnalysis flow for providing AI-powered analysis of legal strategies.
 * It includes:
 * - `generateAnalysis`: The main function to trigger the analysis.
 * - `GenerateAnalysisInput`: Input type for the analysis, including the legal strategy.
 * - `GenerateAnalysisOutput`: Output type for the analysis, providing a structured breakdown.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnalysisInputSchema = z.object({
  legalStrategy: z
    .string()
    .describe('The legal strategy to be analyzed, including case facts and initial arguments.'),
});
export type GenerateAnalysisInput = z.infer<typeof GenerateAnalysisInputSchema>;

const LegalArgumentSchema = z.object({
  argument: z.string().describe('The argument presented by the advocate.'),
  caseCitations: z.array(z.string()).describe('List of case citations used to support the argument.'),
});

const WeaknessSchema = z.object({
  weakness: z.string().describe('Identified weakness in the advocate’s argument.'),
  vulnerabilityScore: z.number().describe('A numerical score indicating the severity of the vulnerability.'),
});

const RebuttalSchema = z.object({
  rebuttal: z.string().describe('The adversary’s rebuttal to the advocate’s argument.'),
  weaknesses: z.array(WeaknessSchema).describe('List of weaknesses identified in the argument.'),
});

const KeyVulnerabilitySchema = z.object({
  vulnerability: z.string().describe('A key vulnerability identified in the legal strategy.'),
  affectedArguments: z
    .array(z.string())
    .describe('List of arguments that are affected by this vulnerability.'),
});

const RefinedStrategySchema = z.object({
  recommendation: z.string().describe('A recommendation to refine the legal strategy.'),
  rationale: z.string().describe('The rationale behind the refined strategy recommendation.'),
});

const PredictiveAnalysisSchema = z.object({
  outcomePrediction: z.string().describe('Prediction of the case outcome based on the analysis.'),
  confidenceLevel: z.number().describe('A numerical score indicating the confidence level of the prediction.'),
});

const AnalysisDashboardSchema = z.object({
  advocateBrief: z
    .array(LegalArgumentSchema)
    .describe('The advocate’s initial arguments and case citations.'),
  adversaryRebuttal: z.array(RebuttalSchema).describe('The adversary’s rebuttals to the advocate’s arguments.'),
  arbiterSynthesis: z
    .object({
      keyVulnerabilities: z.array(KeyVulnerabilitySchema).describe('Key vulnerabilities identified in the legal strategy.'),
      refinedStrategy: z.array(RefinedStrategySchema).describe('Recommendations for refining the legal strategy.'),
      predictiveAnalysis: PredictiveAnalysisSchema.describe('Predictive analysis of the case outcome.'),
    })
    .describe('The arbiter’s synthesis of the arguments and rebuttals.'),
});

const GenerateAnalysisOutputSchema = z.object({
  analysisDashboard: AnalysisDashboardSchema.describe('A structured analysis dashboard of the legal strategy.'),
});
export type GenerateAnalysisOutput = z.infer<typeof GenerateAnalysisOutputSchema>;

export async function generateAnalysis(input: GenerateAnalysisInput): Promise<GenerateAnalysisOutput> {
  return generateAnalysisFlow(input);
}

const generateAnalysisPrompt = ai.definePrompt({
  name: 'generateAnalysisPrompt',
  input: {schema: GenerateAnalysisInputSchema},
  output: {schema: GenerateAnalysisOutputSchema},
  prompt: `You are a highly skilled AI legal analyst. You are tasked with providing a comprehensive analysis of a legal strategy.

  Analyze the provided legal strategy and identify potential weaknesses and suggest improvements.

  Legal Strategy: {{{legalStrategy}}}

  Output a structured analysis dashboard in JSON format.

  Follow this schema:
  ${GenerateAnalysisOutputSchema.description}\n
  Example Format:
  {
    "analysisDashboard": {
      "advocateBrief": [
        {
          "argument": "Advocate's argument 1",
          "caseCitations": ["Case 1", "Case 2"]
        }
      ],
      "adversaryRebuttal": [
        {
          "rebuttal": "Adversary's rebuttal 1",
          "weaknesses": [
            {
              "weakness": "Weakness 1",
              "vulnerabilityScore": 7
            }
          ]
        }
      ],
      "arbiterSynthesis": {
        "keyVulnerabilities": [
          {
            "vulnerability": "Key vulnerability 1",
            "affectedArguments": ["Argument 1"]
          }
        ],
        "refinedStrategy": [
          {
            "recommendation": "Recommendation 1",
            "rationale": "Rationale 1"
          }
        ],
        "predictiveAnalysis": {
          "outcomePrediction": "Likely to succeed",
          "confidenceLevel": 0.8
        }
      }
    }
  }`,
});

const generateAnalysisFlow = ai.defineFlow(
  {
    name: 'generateAnalysisFlow',
    inputSchema: GenerateAnalysisInputSchema,
    outputSchema: GenerateAnalysisOutputSchema,
  },
  async input => {
    const {output} = await generateAnalysisPrompt(input);
    return output!;
  }
);
