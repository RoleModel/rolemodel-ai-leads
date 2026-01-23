import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// POST /api/ab-tests/[id]/variants - Add a variant to a test
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseServer = await createClient()
  const { id } = await params
  const body = await request.json()
  const { name, path, weight, is_control } = body

  if (!name || !path) {
    return NextResponse.json({ error: 'Name and path are required' }, { status: 400 })
  }

  // Check if variant with this path already exists for this test
  const { data: existing } = await supabaseServer
    .from('ab_test_variants')
    .select('id')
    .eq('test_id', id)
    .eq('path', path)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'A variant with this path already exists for this test' },
      { status: 409 }
    )
  }

  const { data: variant, error } = await supabaseServer
    .from('ab_test_variants')
    .insert({
      test_id: id,
      name,
      path,
      weight: weight || 33,
      is_control: is_control || false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(variant, { status: 201 })
}

// PUT /api/ab-tests/[id]/variants - Update all variants' weights
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseServer = await createClient()
  const { id } = await params
  const body = await request.json()
  const { variants } = body as {
    variants: Array<{ id: string; weight: number; is_control?: boolean }>
  }

  if (!variants || !Array.isArray(variants)) {
    return NextResponse.json({ error: 'Variants array is required' }, { status: 400 })
  }

  // Update each variant
  const updates = await Promise.all(
    variants.map(async (v) => {
      const { error } = await supabaseServer
        .from('ab_test_variants')
        .update({
          weight: v.weight,
          ...(v.is_control !== undefined && { is_control: v.is_control }),
        })
        .eq('id', v.id)
        .eq('test_id', id)

      return { id: v.id, error: error?.message }
    })
  )

  const errors = updates.filter((u) => u.error)
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/ab-tests/[id]/variants - Delete a variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseServer = await createClient()
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const variantId = searchParams.get('variantId')

  if (!variantId) {
    return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
  }

  // Check that we're not deleting the last variant
  const { data: variants } = await supabaseServer
    .from('ab_test_variants')
    .select('id')
    .eq('test_id', id)

  if ((variants || []).length <= 1) {
    return NextResponse.json({ error: 'Cannot delete the last variant' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('ab_test_variants')
    .delete()
    .eq('id', variantId)
    .eq('test_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
