import { NextRequest, NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabase/server'

interface EventWithDate {
  event_type: string
  created_at: string
}

// GET /api/ab-tests/[id] - Get a specific A/B test with stats
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: test, error: testError } = await supabase
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
    .eq('id', id)
    .single()

  if (testError) {
    return NextResponse.json({ error: testError.message }, { status: 404 })
  }

  const variants = (test.ab_test_variants || []) as Array<{
    id: string
    name: string
    path: string
    weight: number
    is_control: boolean
    created_at: string
  }>

  // Get stats for each variant
  const variantsWithStats = await Promise.all(
    variants.map(async (variant) => {
      const { data: events } = await supabase
        .from('ab_test_events')
        .select('event_type, created_at')
        .eq('variant_id', variant.id)

      const typedEvents = (events || []) as EventWithDate[]
      const views = typedEvents.filter((e) => e.event_type === 'view').length
      const conversions = typedEvents.filter((e) => e.event_type === 'conversion').length
      const engagements = typedEvents.filter((e) => e.event_type === 'engagement').length
      const bounces = typedEvents.filter((e) => e.event_type === 'bounce').length

      // Get daily stats for the last 7 days
      const dailyStats = getDailyStats(typedEvents)

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
          dailyStats,
        },
      }
    })
  )

  return NextResponse.json({
    ...test,
    ab_test_variants: variantsWithStats,
  })
}

// PUT /api/ab-tests/[id] - Update an A/B test
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const { name, description, status, start_date, end_date } = body

  const { data: test, error } = await supabase
    .from('ab_tests')
    .update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(start_date !== undefined && { start_date }),
      ...(end_date !== undefined && { end_date }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(test)
}

// DELETE /api/ab-tests/[id] - Delete an A/B test
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabaseServer.from('ab_tests').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// Helper function to get daily stats
function getDailyStats(events: EventWithDate[]) {
  const days = 7
  const stats: { date: string; views: number; conversions: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayEvents = events.filter((e) => e.created_at.startsWith(dateStr))

    stats.push({
      date: dateStr,
      views: dayEvents.filter((e) => e.event_type === 'view').length,
      conversions: dayEvents.filter((e) => e.event_type === 'conversion').length,
    })
  }

  return stats
}
