import type {GenerateAnalysisOutput} from '@/ai/flows/generate-analysis';
import {z} from 'zod';

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
  opponentCounselAnalysis: z
    .string()
    .describe(
      "An analysis of the opposing counsel's known strategies or patterns, based on public information and past arbitration records. If no information is available, state that."
    ),
});

export type Project = {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  strategy?: string;
  analysis?: Analysis;
  actionPlan?: ActionItem[];
  mainChatHistory?: ChatMessage[];
};

export type Analysis = GenerateAnalysisOutput['analysisDashboard'];

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
