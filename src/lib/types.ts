import {z} from 'zod';
import type { SimulationState } from './simulation-types';

// For Adversarial Playbook
const CounterRebuttalSchema = z.object({
  counterRebuttal: z.string().describe("A potential counter-rebuttal the opposing counsel might use against our rebuttal."),
  strength: z.enum(["High", "Medium", "Low"]).describe("The estimated strength of this counter-rebuttal.")
});

const RebuttalSchema = z.object({
  rebuttal: z.string().describe('A potential rebuttal to the counter-argument.'),
  citations: z.array(z.string()).describe('Case citations to support the rebuttal.'),
  potentialCounterRebuttals: z.array(CounterRebuttalSchema).describe("A list of potential counter-rebuttals the opponent might use in response to our rebuttal.")
});

const CounterArgumentSchema = z.object({
  counterArgument: z.string().describe('A potential counter-argument the opponent might raise.'),
  rebuttals: z.array(RebuttalSchema).describe('Potential rebuttals to this counter-argument.'),
});

export const AdversarialPlaybookSchema = z.object({
  potentialCounterArguments: z.array(CounterArgumentSchema).describe('An exhaustive list of potential counter-arguments.'),
  opponentCounselAnalysis: z
    .string()
    .describe(
      "An analysis of the opposing counsel's known strategies or patterns, based on public information and past arbitration records. If no information is available, state that."
    ),
});


// For Main Analysis
export const GenerateAnalysisInputSchema = z.object({
  legalStrategy: z.string().describe('The legal strategy to be analyzed, including case facts and initial arguments.'),
});

export const CaseCitationSchema = z.object({
    citation: z.string().describe("The name of the cited case."),
    relevance: z.string().describe("A detailed explanation of how this case supports the argument, including the specific context and linkage to the user's case.")
});

export const LegalArgumentSchema = z.object({
  argument: z.string().describe('A deep, well-reasoned argument presented by the advocate.'),
  caseCitations: z.array(CaseCitationSchema).describe('List of case citations used to support the argument, each with a relevance explanation.'),
});

export const WeaknessSchema = z.object({
  weakness: z.string().describe('A specific weakness identified in the overall strategy.'),
  vulnerabilityScore: z.number().min(1).max(10).describe('A numerical score from 1-10 indicating the severity of the vulnerability (1=low, 10=high).'),
  rationale: z.string().describe("A detailed rationale explaining why this specific vulnerability score was given.")
});

export const KeyVulnerabilitySchema = z.object({
  vulnerability: z.string().describe('A key vulnerability identified in the legal strategy.'),
  affectedArguments: z.array(z.string()).describe('List of arguments that are affected by this vulnerability.'),
});

export const RefinedStrategySchema = z.object({
  recommendation: z.string().describe('A recommendation to refine the legal strategy.'),
  rationale: z.string().describe('The rationale behind the refined strategy recommendation.'),
});

export const PredictiveAnalysisSchema = z.object({
  outcomePrediction: z.string().describe('Prediction of the case outcome based on the analysis.'),
  confidenceLevel: z.number().describe('A numerical score indicating the confidence level of the prediction.'),
});

export const ArbiterSynthesisSchema = z.object({
    keyVulnerabilities: z.array(KeyVulnerabilitySchema).describe('Key vulnerabilities identified in the legal strategy.'),
    refinedStrategy: z.array(RefinedStrategySchema).describe('Recommendations for refining the legal strategy.'),
    predictiveAnalysis: PredictiveAnalysisSchema.describe('Predictive analysis of the case outcome.'),
});

export const ThreePartAnalysisSchema = z.object({
  advocateBrief: z.array(LegalArgumentSchema).describe('The advocate’s initial arguments and case citations.'),
  identifiedWeaknesses: z.array(WeaknessSchema).describe("A list of identified weaknesses in the overall strategy, along with a vulnerability score and rationale."),
  arbiterSynthesis: ArbiterSynthesisSchema.describe('The arbiter’s synthesis of the arguments and rebuttals.'),
});

export const AnalysisDashboardSchema = ThreePartAnalysisSchema.extend({
  adversarialPlaybook: AdversarialPlaybookSchema.describe('An adversarial playbook with counter-arguments and rebuttals.'),
});

// Main Project Type
export type Project = {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  strategy?: string;
  analysis?: z.infer<typeof AnalysisDashboardSchema>;
  actionPlan?: ActionItem[];
  mainChatHistory?: ChatMessage[];
  simulationState?: SimulationState;
};

export type Analysis = z.infer<typeof AnalysisDashboardSchema>;
export type AdversarialPlaybook = z.infer<typeof AdversarialPlaybookSchema>;
export type AdversarialPlaybookData = AdversarialPlaybook;

export type ActionItem = {
  id: string;
  text: string;
  completed: boolean;
  chatHistory?: ChatMessage[];
};

export type ChatMessage = {
  id?: string;
  role: 'user' | 'arbiter';
  content: string;
  createdAt?: any;
};
