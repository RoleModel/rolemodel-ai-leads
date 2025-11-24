import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

// GET - Export leads as CSV
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  let query = supabaseServer
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply date filters if provided
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    const endDateTime = new Date(endDate)
    endDateTime.setDate(endDateTime.getDate() + 1)
    query = query.lt('created_at', endDateTime.toISOString())
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const leads = data || []

  // Generate CSV
  const csvRows = []

  // Header row
  csvRows.push([
    'Date',
    'Name',
    'Email',
    'Company',
    'Industry',
    'Company Size',
    'Role',
    'Decision Maker',
    'Budget Range',
    'Budget Timeline',
    'Budget Approved',
    'Problem',
    'Current Solution',
    'Pain Points',
    'Urgency',
    'Implementation Date',
    'Qualification Score',
    'Next Steps',
  ].join(','))

  // Data rows
  for (const lead of leads) {
    const summary = lead.summary || {}
    const date = new Date(lead.created_at).toLocaleDateString()

    const row = [
      date,
      escapeCSV(lead.visitor_name || ''),
      escapeCSV(lead.visitor_email || ''),
      escapeCSV(summary.companyInfo?.name || ''),
      escapeCSV(summary.companyInfo?.industry || ''),
      escapeCSV(summary.companyInfo?.size || ''),
      escapeCSV(summary.authority?.role || ''),
      summary.authority?.decisionMaker ? 'Yes' : 'No',
      escapeCSV(summary.budget?.range || ''),
      escapeCSV(summary.budget?.timeline || ''),
      summary.budget?.approved ? 'Yes' : 'No',
      escapeCSV(summary.need?.problem || ''),
      escapeCSV(summary.need?.currentSolution || ''),
      escapeCSV(summary.need?.painPoints?.join('; ') || ''),
      escapeCSV(summary.timeline?.urgency || ''),
      escapeCSV(summary.timeline?.implementationDate || ''),
      summary.qualificationScore || '',
      escapeCSV(summary.nextSteps?.join('; ') || ''),
    ]

    csvRows.push(row.join(','))
  }

  const csv = csvRows.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-export.csv"`,
    },
  })
}

function escapeCSV(value: string): string {
  if (!value) return ''

  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}
