import { z } from 'zod'

export const STAGES = [
  'New Lead',
  'Qualified',
  'Demo Scheduled',
  'Proposal Sent',
  'Closed Won',
  'Closed Lost',
] as const

export type Stage = (typeof STAGES)[number]

export const LEGAL_TRANSITIONS: Record<Stage, Stage[]> = {
  'New Lead': ['New Lead', 'Qualified', 'Closed Lost'],
  Qualified: ['Qualified', 'Demo Scheduled', 'Closed Lost'],
  'Demo Scheduled': ['Demo Scheduled', 'Proposal Sent', 'Qualified', 'Closed Lost'],
  'Proposal Sent': ['Proposal Sent', 'Closed Won', 'Closed Lost', 'Demo Scheduled'],
  'Closed Won': ['Closed Won'],
  'Closed Lost': ['Closed Lost', 'New Lead'],
}

export const AnalysisSchema = z.object({
  lead: z.object({
    name: z.string(),
    company: z.string(),
    role: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }),
  score: z.number().int().min(0).max(100),
  temperature: z.enum(['hot', 'warm', 'cold']),
  proposed_stage: z.enum(STAGES),
  summary: z.string(),
  action_items: z.array(
    z.object({
      owner: z.enum(['rep', 'prospect']),
      task: z.string(),
      due_hint: z.string().nullable(),
    }),
  ),
  objections: z.array(z.string()),
  buying_signals: z.array(z.string()),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  next_step: z.string(),
})

export type Analysis = z.infer<typeof AnalysisSchema>

export type GuardrailResult = {
  name: string
  status: 'passed' | 'clamped' | 'flagged'
  detail: string
}

export type AnalyzeResponse = {
  analysis: Analysis
  finalStage: Stage
  guardrails: GuardrailResult[]
  model: string
  latencyMs: number
  usage: { input: number; output: number }
  cached?: boolean
}
