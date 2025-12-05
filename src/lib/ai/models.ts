// Shared AI model definitions with logos and metadata

export interface ModelInfo {
  id: string
  name: string
  provider:
    | 'anthropic'
    | 'openai'
    | 'google'
    | 'xai'
    | 'deepseek'
    | 'cohere'
    | 'meta'
    | 'mistral'
    | 'perplexity'
    | 'bedrock'
    | 'alibaba'
    | 'meituan'
    | 'minimax'
    | 'moonshot'
    | 'groq'
  logo: string
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // Anthropic Claude
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    logo: '/anthropic.svg',
  },
  {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    logo: '/anthropic.svg',
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    logo: '/anthropic.svg',
  },
  {
    id: 'claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    logo: '/anthropic.svg',
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    logo: '/anthropic.svg',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    logo: '/anthropic.svg',
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    logo: '/anthropic.svg',
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    logo: '/anthropic.svg',
  },

  // OpenAI GPT
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', logo: '/chatgpt.svg' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai', logo: '/chatgpt.svg' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', logo: '/chatgpt.svg' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', logo: '/chatgpt.svg' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', logo: '/chatgpt.svg' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai', logo: '/chatgpt.svg' },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    logo: '/chatgpt.svg',
  },
  { id: 'o1', name: 'o1', provider: 'openai', logo: '/chatgpt.svg' },
  { id: 'o1-mini', name: 'o1 Mini', provider: 'openai', logo: '/chatgpt.svg' },
  { id: 'o3-mini', name: 'o3 Mini', provider: 'openai', logo: '/chatgpt.svg' },

  // Google Gemini
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'google',
    logo: '/google.svg',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    logo: '/google.svg',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    logo: '/google.svg',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    logo: '/google.svg',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    logo: '/google.svg',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    logo: '/google.svg',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    logo: '/google.svg',
  },

  // xAI Grok
  { id: 'grok-beta', name: 'Grok Beta', provider: 'xai', logo: '/grok.svg' },
  { id: 'grok-2', name: 'Grok 2', provider: 'xai', logo: '/grok.svg' },

  // DeepSeek
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    logo: '/deepseek.svg',
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    logo: '/deepseek.svg',
  },

  // Cohere Command R
  { id: 'command-r-plus', name: 'Command R+', provider: 'cohere', logo: '/commandr.svg' },
  { id: 'command-r', name: 'Command R', provider: 'cohere', logo: '/commandr.svg' },

  // Meta Llama
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'meta', logo: '/meta.avif' },
  { id: 'llama-3.2-90b', name: 'Llama 3.2 90B', provider: 'meta', logo: '/meta.avif' },
  { id: 'llama-3.2-11b', name: 'Llama 3.2 11B', provider: 'meta', logo: '/meta.avif' },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', provider: 'meta', logo: '/meta.avif' },
  { id: 'llama-3.2-1b', name: 'Llama 3.2 1B', provider: 'meta', logo: '/meta.avif' },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'meta', logo: '/meta.avif' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'meta', logo: '/meta.avif' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'meta', logo: '/meta.avif' },

  // Mistral
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    logo: '/mistral.avif',
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    logo: '/mistral.avif',
  },
  {
    id: 'mistral-nemo',
    name: 'Mistral Nemo',
    provider: 'mistral',
    logo: '/mistral.avif',
  },
  { id: 'codestral', name: 'Codestral', provider: 'mistral', logo: '/mistral.avif' },

  // Perplexity
  {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    provider: 'perplexity',
    logo: '/perplexity.avif',
  },
  { id: 'sonar', name: 'Sonar', provider: 'perplexity', logo: '/perplexity.avif' },

  // Amazon Bedrock
  {
    id: 'bedrock/claude-3.5-sonnet',
    name: 'Bedrock Claude 3.5 Sonnet',
    provider: 'bedrock',
    logo: '/amazonbedrock.avif',
  },
  {
    id: 'bedrock/claude-3-haiku',
    name: 'Bedrock Claude 3 Haiku',
    provider: 'bedrock',
    logo: '/amazonbedrock.avif',
  },
  {
    id: 'bedrock/titan-text',
    name: 'Bedrock Titan Text',
    provider: 'bedrock',
    logo: '/amazonbedrock.avif',
  },

  // Alibaba Qwen
  { id: 'qwen-max', name: 'Qwen Max', provider: 'alibaba', logo: '/alibabacloud.avif' },
  { id: 'qwen-plus', name: 'Qwen Plus', provider: 'alibaba', logo: '/alibabacloud.avif' },
  {
    id: 'qwen-turbo',
    name: 'Qwen Turbo',
    provider: 'alibaba',
    logo: '/alibabacloud.avif',
  },

  // Moonshot AI
  {
    id: 'moonshot-v1-128k',
    name: 'Moonshot v1 128K',
    provider: 'moonshot',
    logo: '/moonshotai.avif',
  },
  {
    id: 'moonshot-v1-32k',
    name: 'Moonshot v1 32K',
    provider: 'moonshot',
    logo: '/moonshotai.avif',
  },

  // MiniMax
  { id: 'abab6.5', name: 'Abab 6.5', provider: 'minimax', logo: '/minimax.avif' },
  { id: 'abab6.5s', name: 'Abab 6.5s', provider: 'minimax', logo: '/minimax.avif' },

  // Meituan
  {
    id: 'meituan-vision',
    name: 'Meituan Vision',
    provider: 'meituan',
    logo: '/meituan.avif',
  },

  // Groq (fast inference for open source models)
  {
    id: 'groq/llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    logo: '/groq.svg',
  },
  {
    id: 'groq/llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B (Groq)',
    provider: 'groq',
    logo: '/groq.svg',
  },
  {
    id: 'groq/llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant (Groq)',
    provider: 'groq',
    logo: '/groq.svg',
  },
  {
    id: 'groq/mixtral-8x7b-32768',
    name: 'Mixtral 8x7B (Groq)',
    provider: 'groq',
    logo: '/groq.svg',
  },
  {
    id: 'groq/gemma2-9b-it',
    name: 'Gemma 2 9B (Groq)',
    provider: 'groq',
    logo: '/groq.svg',
  },
]

// Helper to get model info by ID
export function getModelById(modelId: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId)
}

// Get models by provider
export function getModelsByProvider(provider: ModelInfo['provider']): ModelInfo[] {
  return AVAILABLE_MODELS.filter((m) => m.provider === provider)
}

// Group models by provider for dropdowns
export function getModelsGroupedByProvider(): Record<string, ModelInfo[]> {
  return AVAILABLE_MODELS.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    },
    {} as Record<string, ModelInfo[]>
  )
}

// Provider display names
export const PROVIDER_NAMES: Record<ModelInfo['provider'], string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
  xai: 'xAI',
  deepseek: 'DeepSeek',
  cohere: 'Cohere',
  meta: 'Meta',
  mistral: 'Mistral',
  perplexity: 'Perplexity',
  bedrock: 'Amazon Bedrock',
  alibaba: 'Alibaba',
  meituan: 'Meituan',
  minimax: 'MiniMax',
  moonshot: 'Moonshot',
  groq: 'Groq',
}
