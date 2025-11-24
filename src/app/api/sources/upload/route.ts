import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { generateEmbedding } from "@/lib/ai/embeddings"
import type { Database } from "@/lib/supabase/database.types"

const DEFAULT_CHATBOT_ID = "a0000000-0000-0000-0000-000000000001"

type SourceInsert = Database['public']['Tables']['sources']['Insert']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const chatbotId = formData.get('chatbotId') as string || DEFAULT_CHATBOT_ID

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const file of files) {
      try {
        // Read file content as text
        const content = await file.text()

        if (!content.trim()) {
          errors.push({ file: file.name, error: 'File is empty' })
          continue
        }

        // Generate embedding
        const embeddingArray = await generateEmbedding(content)
        const embedding = JSON.stringify(embeddingArray)

        // Insert source
        const sourceData: SourceInsert = {
          chatbot_id: chatbotId,
          title: file.name,
          content,
          embedding,
          metadata: {
            type: 'file',
            filename: file.name,
            size: file.size,
            mimeType: file.type,
          } as any,
        }

        const { data, error } = await supabaseServer
          .from('sources')
          .insert([sourceData])
          .select()
          .single()

        if (error) {
          errors.push({ file: file.name, error: error.message })
        } else {
          results.push(data)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({ file: file.name, error: errorMessage })
      }
    }

    return NextResponse.json({
      sources: results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: unknown) {
    console.error('Error uploading files:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
