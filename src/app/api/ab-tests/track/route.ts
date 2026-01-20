import { NextRequest, NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabase/server'

interface Variant {
  id: string
  name: string
  path: string
  weight: number
}

// POST /api/ab-tests/track - Track an A/B test event
export async function POST(request: NextRequest) {
  const body = await request.json()

  const { variant_id, path, event_type, session_id, visitor_id, metadata } = body

  // Validate event type
  const validEventTypes = ['view', 'engagement', 'conversion', 'bounce']
  if (!validEventTypes.includes(event_type)) {
    return NextResponse.json(
      { error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}` },
      { status: 400 }
    )
  }

  // If variant_id is not provided, look it up by path
  let resolvedVariantId = variant_id

  if (!resolvedVariantId && path) {
    // Find the variant by path from an active test
    const { data: variant } = await supabase
      .from('ab_test_variants')
      .select(
        `
        id,
        ab_tests!inner (
          id,
          status
        )
      `
      )
      .eq('path', path)
      .eq('ab_tests.status', 'active')
      .single()

    if (variant) {
      resolvedVariantId = variant.id
    }
  }

  if (!resolvedVariantId) {
    return NextResponse.json(
      { error: 'variant_id or valid path is required' },
      { status: 400 }
    )
  }

  // Insert the event
  const { data: event, error } = await supabase
    .from('ab_test_events')
    .insert({
      variant_id: resolvedVariantId,
      event_type,
      session_id: session_id || null,
      visitor_id: visitor_id || null,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(event, { status: 201 })
}

// GET /api/ab-tests/track - Get variant assignment for a visitor
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testId = searchParams.get('test_id')
  const visitorId = searchParams.get('visitor_id')

  if (!testId) {
    return NextResponse.json({ error: 'test_id is required' }, { status: 400 })
  }

  // Get active test with variants
  const { data: test, error: testError } = await supabase
    .from('ab_tests')
    .select(
      `
      id,
      status,
      ab_test_variants (
        id,
        name,
        path,
        weight
      )
    `
    )
    .eq('id', testId)
    .eq('status', 'active')
    .single()

  if (testError || !test) {
    return NextResponse.json({ error: 'Test not found or not active' }, { status: 404 })
  }

  const variants = (test.ab_test_variants || []) as Variant[]

  if (variants.length === 0) {
    return NextResponse.json({ error: 'No variants found' }, { status: 404 })
  }

  // If visitor has an existing assignment, return it
  if (visitorId) {
    const { data: existingEvent } = await supabase
      .from('ab_test_events')
      .select('variant_id')
      .eq('visitor_id', visitorId)
      .in(
        'variant_id',
        variants.map((v: Variant) => v.id)
      )
      .limit(1)
      .single()

    if (existingEvent) {
      const assignedVariant = variants.find(
        (v: Variant) => v.id === existingEvent.variant_id
      )
      if (assignedVariant) {
        return NextResponse.json({
          variant: assignedVariant,
          isReturningVisitor: true,
        })
      }
    }
  }

  // Assign a new variant based on weights
  const totalWeight = variants.reduce((sum: number, v: Variant) => sum + v.weight, 0)
  const random = Math.random() * totalWeight
  let cumulativeWeight = 0

  for (const variant of variants) {
    cumulativeWeight += variant.weight
    if (random <= cumulativeWeight) {
      return NextResponse.json({
        variant,
        isReturningVisitor: false,
      })
    }
  }

  // Fallback to first variant
  return NextResponse.json({
    variant: variants[0],
    isReturningVisitor: false,
  })
}
