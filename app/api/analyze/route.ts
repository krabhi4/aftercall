import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import {
  AnalysisSchema,
  LEGAL_TRANSITIONS,
  STAGES,
  type GuardrailResult,
  type Stage,
} from '@/lib/schema'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const MODEL = 'claude-opus-5'

const SYSTEM = `You are the post-call analysis stage of a CRM pipeline for B2B sales teams. You receive one raw call transcript between a sales rep and a prospect, plus the deal's current pipeline stage. Extract exactly what the schema asks for.

Rules:
- Ground every field in the transcript. Use null for contact fields that were never mentioned; never invent emails, phones, or names.
- score reflects likelihood this deal eventually closes (0-100). Be conservative: verbal enthusiasm without concrete next steps caps at 60.
- temperature must be consistent with score: hot means 70+, warm 40-69, cold below 40.
- proposed_stage is where this deal should sit AFTER this call, chosen only from the provided stages. Propose Closed Won only on explicit verbal commitment to buy with agreed terms.
- action_items are concrete commitments made on the call, each owned by rep or prospect.
- summary is at most two sentences, written for a sales manager skimming a pipeline review.`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
      { status: 500 },
    )
  }
  const body = await req.json().catch(() => null)
  const transcript = typeof body?.transcript === 'string' ? body.transcript.trim() : ''
  const currentStage: Stage = STAGES.includes(body?.currentStage) ? body.currentStage : 'New Lead'
  if (transcript.length < 80) {
    return NextResponse.json(
      { error: 'Transcript is too short to analyze (minimum ~80 characters).' },
      { status: 400 },
    )
  }
  if (transcript.length > 30000) {
    return NextResponse.json({ error: 'Transcript is too long for this demo.' }, { status: 400 })
  }

  const client = new Anthropic()
  const started = Date.now()

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Current pipeline stage: ${currentStage}\n\nTranscript:\n${transcript}`,
      },
    ],
    output_config: { format: zodOutputFormat(AnalysisSchema) },
  })

  const latencyMs = Date.now() - started

  if (response.stop_reason === 'refusal') {
    return NextResponse.json(
      { error: 'The model declined to analyze this transcript.' },
      { status: 422 },
    )
  }

  const analysis = response.parsed_output
  const guardrails: GuardrailResult[] = []

  if (!analysis) {
    return NextResponse.json(
      { error: 'Model output failed schema validation. Try again.' },
      { status: 502 },
    )
  }
  guardrails.push({
    name: 'schema_validation',
    status: 'passed',
    detail: 'Output parsed against the strict Zod schema on the first attempt.',
  })

  let finalStage = analysis.proposed_stage
  const legal = LEGAL_TRANSITIONS[currentStage]
  if (!legal.includes(finalStage)) {
    const fallback = legal[0]
    guardrails.push({
      name: 'stage_transition',
      status: 'clamped',
      detail: `Model proposed ${finalStage}, but ${currentStage} → ${finalStage} is not a legal transition. Clamped to ${fallback}; legal moves are ${legal.join(', ')}.`,
    })
    finalStage = fallback
  } else {
    guardrails.push({
      name: 'stage_transition',
      status: 'passed',
      detail: `${currentStage} → ${finalStage} is a legal pipeline move.`,
    })
  }

  const band =
    analysis.temperature === 'hot'
      ? analysis.score >= 70
      : analysis.temperature === 'warm'
        ? analysis.score >= 40 && analysis.score < 70
        : analysis.score < 40
  guardrails.push(
    band
      ? {
          name: 'score_consistency',
          status: 'passed',
          detail: `Score ${analysis.score} sits inside the ${analysis.temperature} band.`,
        }
      : {
          name: 'score_consistency',
          status: 'flagged',
          detail: `Score ${analysis.score} is outside the ${analysis.temperature} band; surfaced for human review instead of silently accepted.`,
        },
  )

  const inventedContact =
    (analysis.lead.email && !transcript.toLowerCase().includes(analysis.lead.email.toLowerCase())) ||
    (analysis.lead.phone && !transcript.replace(/[\s-]/g, '').includes(analysis.lead.phone.replace(/[\s-]/g, '')))
  guardrails.push(
    inventedContact
      ? {
          name: 'contact_provenance',
          status: 'flagged',
          detail: 'Extracted contact details do not appear verbatim in the transcript; flagged as possible hallucination.',
        }
      : {
          name: 'contact_provenance',
          status: 'passed',
          detail: 'Every extracted contact detail appears verbatim in the transcript.',
        },
  )

  return NextResponse.json({
    analysis,
    finalStage,
    guardrails,
    model: MODEL,
    latencyMs,
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  })
}
