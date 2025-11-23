import { embedding } from './gateway'
import { embed } from 'ai'

/**
 * Generate embeddings for text using OpenAI's text-embedding-ada-002 via Vercel AI Gateway
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding: result } = await embed({
    model: embedding('openai/text-embedding-ada-002'),
    value: text,
  })

  return result
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = await Promise.all(
    texts.map(text => generateEmbedding(text))
  )

  return embeddings
}
