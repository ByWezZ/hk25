import { config } from 'dotenv';
config();

import '@/ai/flows/generate-analysis.ts';
import '@/ai/flows/scoped-chat.ts';
import '@/ai/flows/chat-with-arbiter.ts';
import '@/ai/flows/generate-action-plan.ts';
import '@/ai/flows/generate-legal-summarization.ts';