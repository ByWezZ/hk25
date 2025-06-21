'use server';

import { generateAnalysis as genAnalysisFlow } from '@/ai/flows/generate-analysis';
import type { GenerateAnalysisInput, GenerateAnalysisOutput } from '@/ai/flows/generate-analysis';
import { generateActionPlan as genActionPlanFlow } from '@/ai/flows/generate-action-plan';
import type { GenerateActionPlanInput, GenerateActionPlanOutput } from '@/ai/flows/generate-action-plan';
import { generateLegalSummary as genLegalSummaryFlow } from '@/ai/flows/generate-legal-summarization';
import type { GenerateLegalSummaryInput, GenerateLegalSummaryOutput } from '@/ai/flows/generate-legal-summarization';

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
