import { embed } from 'ai'

import { embedding } from './gateway'

/**
 * Generate embeddings for text using OpenAI's text-embedding-3-small via Vercel AI Gateway
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding: result } = await embed({
    model: embedding('openai/text-embedding-3-small'),
    value: text,
  })

  return result
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = await Promise.all(texts.map((text) => generateEmbedding(text)))

  return embeddings
}
