import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// GET /api/ab-tests - Get all A/B tests with their variants and stats
export async function GET() {
  const supabaseServer = await createClient()
  const { data: tests, error: testsError } = await supabaseServer
    .from('ab_tests')
    .select(
      `
      *,
      ab_test_variants (
        id,
        name,
        path,
        weight,
        is_control,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false })

  if (testsError) {
    return NextResponse.json({ error: testsError.message }, { status: 500 })
  }

  // Get stats for each variant
  const testsWithStats = await Promise.all(
    (tests || []).map(async (test) => {
      const variants = (test.ab_test_variants || []) as Array<{
        id: string
        name: string
        path: string
        weight: number
        is_control: boolean
        created_at: string
      }>

      const variantsWithStats = await Promise.all(
        variants.map(async (variant) => {
          const { data: events } = await supabaseServer
            .from('ab_test_events')
            .select('event_type')
            .eq('variant_id', variant.id)

          const eventList = (events || []) as Array<{ event_type: string }>
          const views = eventList.filter((e) => e.event_type === 'view').length
          const conversions = eventList.filter(
            (e) => e.event_type === 'conversion'
          ).length
          const engagements = eventList.filter(
            (e) => e.event_type === 'engagement'
          ).length
          const bounces = eventList.filter((e) => e.event_type === 'bounce').length

          return {
            ...variant,
            stats: {
              views,
              conversions,
              engagements,
              bounces,
              conversionRate: views > 0 ? (conversions / views) * 100 : 0,
              engagementRate: views > 0 ? (engagements / views) * 100 : 0,
              bounceRate: views > 0 ? (bounces / views) * 100 : 0,
            },
          }
        })
      )

      return {
        ...test,
        ab_test_variants: variantsWithStats,
      }
    })
  )

  return NextResponse.json(testsWithStats)
}

// POST /api/ab-tests - Create a new A/B test
export async function POST(request: NextRequest) {
  const supabaseServer = await createClient()
  const body = await request.json()
  const { name, description, variants } = body

  if (!name || !variants || !Array.isArray(variants) || variants.length < 2) {
    return NextResponse.json(
      { error: 'Name and at least 2 variants are required' },
      { status: 400 }
    )
  }

  // Create the test
  const { data: test, error: testError } = await supabaseServer
    .from('ab_tests')
    .insert({
      name,
      description,
      status: 'draft',
    })
    .select()
    .single()

  if (testError || !test) {
    return NextResponse.json(
      { error: testError?.message || 'Failed to create test' },
      { status: 500 }
    )
  }

  // Create the variants
  const variantsToInsert = variants.map(
    (
      v: { name: string; path: string; weight?: number; is_control?: boolean },
      index: number
    ) => ({
      test_id: test.id,
      name: v.name,
      path: v.path,
      weight: v.weight || Math.floor(100 / variants.length),
      is_control: v.is_control || index === 0,
    })
  )

  const { error: variantsError } = await supabaseServer
    .from('ab_test_variants')
    .insert(variantsToInsert)

  if (variantsError) {
    // Rollback test creation
    await supabaseServer.from('ab_tests').delete().eq('id', test.id)
    return NextResponse.json({ error: variantsError.message }, { status: 500 })
  }

  return NextResponse.json(test, { status: 201 })
}
