import type { GenerateAnalysisOutput } from "@/ai/flows/generate-analysis";

export type Project = {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  strategy?: string;
  analysis?: Analysis;
  actionPlan?: ActionItem[];
};

export type Analysis = GenerateAnalysisOutput['analysisDashboard'];

export type ActionItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'arbiter' | 'system';
  content: string;
  createdAt: any;
};
