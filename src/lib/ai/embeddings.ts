import { embed } from 'ai'

/**
 * Generate embeddings for text using OpenAI's text-embedding-3-small via Vercel AI Gateway
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: 'openai/text-embedding-3-small',
    value: text,
  })

  return embedding
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = await Promise.all(texts.map((text) => generateEmbedding(text)))

  return embeddings
}
