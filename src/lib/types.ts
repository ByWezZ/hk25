import type { GenerateAnalysisOutput } from "@/ai/flows/generate-analysis";
import type { AdversarialPlaybook } from "@/ai/flows/generate-adversarial-playbook";

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
