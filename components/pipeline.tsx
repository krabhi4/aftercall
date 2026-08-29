'use client'

import { useState } from 'react'
import { STAGES, type AnalyzeResponse, type Stage } from '@/lib/schema'
import { SAMPLES } from '@/lib/samples'

const TEMP_STYLE: Record<string, string> = {
  hot: 'text-amber',
  warm: 'text-bone',
  cold: 'text-bone-faint',
}

const RAIL_STYLE: Record<string, string> = {
  passed: 'text-ok',
  clamped: 'text-warn',
  flagged: 'text-amber',
}

export function Pipeline() {
  const [transcript, setTranscript] = useState(SAMPLES[0].transcript)
  const [currentStage, setCurrentStage] = useState<Stage>(SAMPLES[0].currentStage as Stage)
  const [activeSample, setActiveSample] = useState<string | null>(SAMPLES[0].id)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickSample = (id: string) => {
    const s = SAMPLES.find((x) => x.id === id)
    if (!s) return
    setActiveSample(id)
    setTranscript(s.transcript)
    setCurrentStage(s.currentStage as Stage)
    setResult(null)
    setError(null)
  }

  const run = async () => {
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, currentStage }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed.')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setRunning(false)
    }
  }

  const a = result?.analysis

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-24">
      <header className="flex items-baseline justify-between border-b border-seam pt-7 pb-4">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-sm tracking-[0.35em] text-bone">AFTERCALL</span>
          <span className="hidden font-mono text-[11px] tracking-[0.2em] text-amber sm:inline">
            LIVE PIPELINE
          </span>
        </div>
        <a
          href="https://github.com/krabhi4/aftercall"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-bone-dim underline-offset-4 hover:text-bone hover:underline"
        >
          Source
        </a>
      </header>

      <section className="grid gap-x-16 gap-y-5 pt-12 pb-12 lg:grid-cols-[3fr_2fr]">
        <h1 className="text-[clamp(2.2rem,5.5vw,4rem)] leading-[0.98] font-bold tracking-tight">
          The call ended.
          <br />
          The CRM <span className="text-amber">updated itself.</span>
        </h1>
        <p className="max-w-md self-end text-[15px] leading-relaxed text-bone-dim">
          Paste a sales-call transcript. Claude extracts a strictly-typed analysis, four
          deterministic guardrails check every claim it makes, and the deal card lands where it
          belongs on the board. Nothing here is mocked: this runs the Claude API on every click.
        </p>
      </section>

      <div className="grid items-start gap-10 xl:grid-cols-[400px_1fr]">
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => pickSample(s.id)}
                className={`border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
                  activeSample === s.id
                    ? 'border-amber text-amber'
                    : 'border-seam text-bone-dim hover:border-bone-faint hover:text-bone'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value)
              setActiveSample(null)
            }}
            spellCheck={false}
            className="h-[430px] w-full resize-none border border-seam bg-coal-well p-4 font-mono text-[12.5px] leading-relaxed text-bone-dim outline-none focus:border-bone-faint"
          />
          <div className="flex items-center gap-3">
            <label className="font-mono text-[11px] tracking-wide text-bone-faint">
              DEAL CURRENTLY IN
            </label>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(e.target.value as Stage)}
              className="border border-seam bg-coal-raised px-2 py-1.5 font-mono text-[12px] text-bone outline-none"
            >
              {STAGES.filter((s) => !s.startsWith('Closed')).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={run}
              disabled={running}
              className="ml-auto bg-amber px-6 py-2 text-sm font-semibold text-coal transition-colors hover:bg-amber-deep disabled:opacity-50"
            >
              {running ? 'Analyzing…' : 'Run pipeline'}
            </button>
          </div>
          {error && <p className="text-sm text-warn">{error}</p>}
        </section>

        <div className="min-w-0 space-y-10">
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-mono text-[11px] tracking-[0.25em] text-bone-faint">
                PIPELINE BOARD
              </h2>
              {result && (
                <span className="font-mono text-[11px] text-bone-dim">
                  {currentStage} <span className="text-amber">→</span> {result.finalStage}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-px border border-seam bg-seam md:grid-cols-6">
              {STAGES.map((stage) => {
                const isFrom = stage === currentStage && (!result || result.finalStage !== stage)
                const isLanded = result?.finalStage === stage
                return (
                  <div key={stage} className="min-h-[150px] bg-coal-well p-2">
                    <div className="mb-2 font-mono text-[9.5px] leading-tight tracking-[0.14em] text-bone-faint uppercase">
                      {stage}
                    </div>
                    {running && isFrom && <div className="scanning h-16 border border-seam" />}
                    {!running && isFrom && (
                      <div className="border border-dashed border-seam p-2 font-mono text-[10px] text-bone-faint">
                        deal is here
                      </div>
                    )}
                    {isLanded && a && (
                      <div className="card-land border border-amber bg-coal-raised p-2.5">
                        <div className="text-[13px] font-semibold">{a.lead.name}</div>
                        <div className="text-[11px] text-bone-dim">{a.lead.company}</div>
                        <div className="mt-2 flex items-baseline justify-between font-mono text-[11px]">
                          <span className={TEMP_STYLE[a.temperature]}>{a.temperature}</span>
                          <span className="text-bone">{a.score}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {a && result && (
            <section className="trail-in grid gap-10 lg:grid-cols-2">
              <div className="space-y-5">
                <h2 className="font-mono text-[11px] tracking-[0.25em] text-bone-faint">
                  EXTRACTION
                </h2>
                <p className="text-[15px] leading-relaxed">{a.summary}</p>
                <dl className="space-y-2 font-mono text-[12.5px]">
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-bone-faint">contact</dt>
                    <dd className="text-bone-dim">
                      {[a.lead.role, a.lead.email, a.lead.phone].filter(Boolean).join(' · ') ||
                        'none stated'}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-bone-faint">sentiment</dt>
                    <dd className="text-bone-dim">{a.sentiment}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-bone-faint">next step</dt>
                    <dd className="text-bone-dim">{a.next_step}</dd>
                  </div>
                </dl>
                {a.buying_signals.length > 0 && (
                  <div>
                    <h3 className="mb-1.5 font-mono text-[11px] tracking-wide text-ok">
                      buying signals
                    </h3>
                    <ul className="space-y-1 text-[13.5px] text-bone-dim">
                      {a.buying_signals.map((s, i) => (
                        <li key={i}>+ {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {a.objections.length > 0 && (
                  <div>
                    <h3 className="mb-1.5 font-mono text-[11px] tracking-wide text-warn">
                      objections
                    </h3>
                    <ul className="space-y-1 text-[13.5px] text-bone-dim">
                      {a.objections.map((s, i) => (
                        <li key={i}>− {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {a.action_items.length > 0 && (
                  <div>
                    <h3 className="mb-1.5 font-mono text-[11px] tracking-wide text-bone-faint">
                      action items
                    </h3>
                    <ul className="space-y-1.5 text-[13.5px]">
                      {a.action_items.map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span
                            className={`shrink-0 font-mono text-[10.5px] uppercase ${
                              item.owner === 'rep' ? 'text-amber' : 'text-bone-faint'
                            }`}
                          >
                            {item.owner}
                          </span>
                          <span className="text-bone-dim">
                            {item.task}
                            {item.due_hint ? ` (${item.due_hint})` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <h2 className="font-mono text-[11px] tracking-[0.25em] text-bone-faint">
                  GUARDRAILS
                </h2>
                <ol className="divide-y divide-seam border border-seam">
                  {result.guardrails.map((g) => (
                    <li key={g.name} className="p-3.5">
                      <div className="flex items-baseline justify-between font-mono text-[12px]">
                        <span className="text-bone">{g.name}</span>
                        <span className={RAIL_STYLE[g.status]}>{g.status.toUpperCase()}</span>
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-bone-dim">{g.detail}</p>
                    </li>
                  ))}
                </ol>
                <p className="font-mono text-[11px] leading-relaxed text-bone-faint">
                  {result.model} · {(result.latencyMs / 1000).toFixed(1)}s · {result.usage.input}{' '}
                  tokens in / {result.usage.output} out
                </p>
              </div>
            </section>
          )}

          {!a && !running && (
            <p className="border border-dashed border-seam px-4 py-10 text-center text-sm text-bone-faint">
              Run the pipeline to see the extraction, the guardrail checks, and the card move.
            </p>
          )}
        </div>
      </div>

      <footer className="mt-20 flex flex-wrap items-baseline justify-between gap-3 border-t border-seam pt-5 text-xs text-bone-faint">
        <span>
          Built by{' '}
          <a
            href="https://github.com/krabhi4"
            target="_blank"
            rel="noreferrer"
            className="text-bone-dim underline underline-offset-4 hover:text-bone"
          >
            Kumar Abhishek
          </a>{' '}
          — Next.js, Claude API structured outputs, deterministic guardrails.
        </span>
        <span>Transcripts are fictional. The API calls are not.</span>
      </footer>
    </main>
  )
}
