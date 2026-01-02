import { createGateway } from '@ai-sdk/gateway'

// Vercel AI Gateway configuration
// Provides unified access to all AI models through a single interface
export const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1/ai',
})

// Export as 'openai' for compatibility with existing code
// Models should use format: 'openai/gpt-4o-mini', 'anthropic/claude-3-5-sonnet', etc.
export const openai = (modelId: string) => gateway(modelId)
export const embedding = (modelId: string) => gateway.embeddingModel(modelId)
