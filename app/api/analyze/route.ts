import { NextRequest, NextResponse } from 'next/server'
import { runAnalysis } from '@/lib/analyze'
import { STAGES, type Stage } from '@/lib/schema'
import { SAMPLES } from '@/lib/samples'
import hotDemo from '@/lib/fixtures/hot-demo.json'
import warmDiscovery from '@/lib/fixtures/warm-discovery.json'
import lostBudget from '@/lib/fixtures/lost-budget.json'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FIXTURES: Record<string, unknown> = {
  'hot-demo': hotDemo,
  'warm-discovery': warmDiscovery,
  'lost-budget': lostBudget,
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const transcript = typeof body?.transcript === 'string' ? body.transcript.trim() : ''
  const currentStage: Stage = STAGES.includes(body?.currentStage) ? body.currentStage : 'New Lead'
  const sampleId = typeof body?.sampleId === 'string' ? body.sampleId : null

  if (transcript.length < 80) {
    return NextResponse.json(
      { error: 'Transcript is too short to analyze (minimum ~80 characters).' },
      { status: 400 },
    )
  }
  if (transcript.length > 30000) {
    return NextResponse.json({ error: 'Transcript is too long for this demo.' }, { status: 400 })
  }

  if (sampleId) {
    const sample = SAMPLES.find((s) => s.id === sampleId)
    if (
      sample &&
      sample.transcript.trim() === transcript &&
      sample.currentStage === currentStage
    ) {
      const fixture = FIXTURES[sampleId]
      if (fixture) return NextResponse.json({ ...fixture, cached: true })
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          'Live analysis is not configured on this deployment. Pick one of the sample transcripts to see cached results from real runs.',
      },
      { status: 503 },
    )
  }

  try {
    const run = await runAnalysis(transcript, currentStage)
    return NextResponse.json({ ...run, cached: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed.'
    const status = /quota|rate|429/i.test(message) ? 429 : 502
    return NextResponse.json(
      {
        error:
          status === 429
            ? 'The free-tier rate limit was hit. Wait a minute and try again.'
            : message,
      },
      { status },
    )
  }
}
