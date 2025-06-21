'use server';

import { generateAnalysis as genAnalysisFlow } from '@/ai/flows/generate-analysis';
import type { GenerateAnalysisInput, GenerateAnalysisOutput } from '@/ai/flows/generate-analysis';
import { generateActionPlan as genActionPlanFlow } from '@/ai/flows/generate-action-plan';
import type { GenerateActionPlanInput, GenerateActionPlanOutput } from '@/ai/flows/generate-action-plan';
import { generateLegalSummary as genLegalSummaryFlow } from '@/ai/flows/generate-legal-summarization';
import type { GenerateLegalSummaryInput, GenerateLegalSummaryOutput } from '@/ai/flows/generate-legal-summarization';
import { chatWithArbiter as chatWithArbiterFlow } from '@/ai/flows/chat-with-arbiter';
import type { ChatWithArbiterInput, ChatWithArbiterOutput } from '@/ai/flows/chat-with-arbiter';
import { scopedChat as scopedChatFlow } from '@/ai/flows/scoped-chat';
import type { ScopedChatInput, ScopedChatOutput } from '@/ai/flows/scoped-chat';
import { optimizePrompt as optimizePromptFlow } from '@/ai/flows/optimize-prompt';
import type { OptimizePromptInput, OptimizePromptOutput } from '@/ai/flows/optimize-prompt';
import { generateAdversarialPlaybook as generateAdversarialPlaybookFlow } from '@/ai/flows/generate-adversarial-playbook';
import type { GenerateAdversarialPlaybookInput, GenerateAdversarialPlaybookOutput } from '@/ai/flows/generate-adversarial-playbook';

export async function generateAnalysis(
  input: GenerateAnalysisInput
): Promise<GenerateAnalysisOutput> {
  return await genAnalysisFlow(input);
}

export async function generateActionPlan(
  input: GenerateActionPlanInput
): Promise<GenerateActionPlanOutput> {
  return await genActionPlanFlow(input);
}

export async function generateLegalSummary(
  input: GenerateLegalSummaryInput
): Promise<GenerateLegalSummaryOutput> {
  return await genLegalSummaryFlow(input);
}

export async function chatWithArbiter(
  input: ChatWithArbiterInput
): Promise<ChatWithArbiterOutput> {
  return await chatWithArbiterFlow(input);
}

export async function scopedChat(
  input: ScopedChatInput
): Promise<ScopedChatOutput> {
  return await scopedChatFlow(input);
}

export async function optimizePrompt(
    input: OptimizePromptInput
): Promise<OptimizePromptOutput> {
    return await optimizePromptFlow(input);
}

export async function generateAdversarialPlaybook(
    input: GenerateAdversarialPlaybookInput
): Promise<GenerateAdversarialPlaybookOutput> {
    return await generateAdversarialPlaybookFlow(input);
}
