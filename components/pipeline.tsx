'use client'

import { useState } from 'react'
import { STAGES, type AnalyzeResponse, type Stage } from '@/lib/schema'
import { SAMPLES } from '@/lib/samples'

const RAIL_STYLE: Record<string, string> = {
  passed: 'text-pass',
  clamped: 'text-clamp',
  flagged: 'text-flag',
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
        body: JSON.stringify({ transcript, currentStage, sampleId: activeSample }),
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
    <main className="mx-auto w-full max-w-7xl px-5 pb-20 text-[13px]">
      <header className="flex items-baseline justify-between border-b-2 border-ink pt-6 pb-3">
        <div className="flex items-baseline gap-4">
          <span className="text-base font-bold">AFTERCALL</span>
          <span className="hidden text-ink-faint sm:inline">transcript → typed CRM truth</span>
        </div>
        <a href="https://github.com/krabhi4/aftercall" target="_blank" rel="noreferrer">
          source
        </a>
      </header>

      <section className="grid gap-x-14 gap-y-4 border-b border-rule py-8 lg:grid-cols-[3fr_2fr]">
        <h1 className="text-[clamp(1.6rem,3.6vw,2.6rem)] leading-tight font-bold">
          The call ended.
          <br />
          The CRM updated itself.
        </h1>
        <div className="max-w-md self-end leading-relaxed text-ink-soft">
          <p>
            Paste a sales-call transcript. An LLM extracts a strictly-typed analysis, four
            deterministic guardrails check every claim, and the deal lands where it belongs.
          </p>
          <p className="mt-2 text-ink-faint">
            Samples serve cached results from real runs. A custom transcript runs live.
          </p>
        </div>
      </section>

      <div className="grid items-start gap-10 pt-8 xl:grid-cols-[400px_1fr]">
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => pickSample(s.id)}
                className={`btn-ghost px-2.5 py-1 text-[11.5px] ${activeSample === s.id ? 'active' : ''}`}
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
            className="ruled-table h-[420px] w-full resize-none bg-paper p-3 text-[12px] leading-relaxed text-ink-soft outline-none focus:bg-hi/30"
          />
          <div className="flex items-center gap-3">
            <label className="text-[11px] text-ink-faint">deal currently in</label>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(e.target.value as Stage)}
              className="btn-ghost px-2 py-1 text-[12px] outline-none"
            >
              {STAGES.filter((s) => !s.startsWith('Closed')).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button onClick={run} disabled={running} className="btn-ink ml-auto px-5 py-1.5 font-bold">
              {running ? (
                <span className="working-dots">analyzing</span>
              ) : (
                'RUN PIPELINE'
              )}
            </button>
          </div>
          {error && <p className="font-bold text-clamp">! {error}</p>}
        </section>

        <div className="min-w-0 space-y-9">
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-bold">PIPELINE</h2>
              {result && (
                <span className="text-ink-soft">
                  {currentStage} → <span className="font-bold">{result.finalStage}</span>
                </span>
              )}
            </div>
            <div className="ruled-table grid grid-cols-3 md:grid-cols-6">
              {STAGES.map((stage, i) => {
                const isFrom = stage === currentStage && (!result || result.finalStage !== stage)
                const isLanded = result?.finalStage === stage
                return (
                  <div
                    key={stage}
                    className={`min-h-[140px] p-2 ${i > 0 ? 'border-l border-rule' : ''}`}
                  >
                    <div className="border-b-2 border-ink pb-1 text-[10px] font-bold uppercase">
                      {stage}
                    </div>
                    <div className="pt-2">
                      {running && isFrom && (
                        <div className="border-2 border-dashed border-ink-faint p-2 text-[11px] text-ink-faint">
                          <span className="working-dots">reading</span>
                        </div>
                      )}
                      {!running && isFrom && (
                        <div className="border-2 border-dashed border-ink-faint p-2 text-[11px] text-ink-faint">
                          deal is here
                        </div>
                      )}
                      {isLanded && a && (
                        <div className="hard-card card-land p-2">
                          <div className="font-bold">{a.lead.name}</div>
                          <div className="text-[11px] text-ink-soft">{a.lead.company}</div>
                          <div className="mt-1.5 flex items-baseline justify-between text-[11px]">
                            <span
                              className={
                                a.temperature === 'hot'
                                  ? 'font-bold text-clamp'
                                  : a.temperature === 'warm'
                                    ? 'text-flag'
                                    : 'text-ink-faint'
                              }
                            >
                              {a.temperature.toUpperCase()}
                            </span>
                            <span className="font-bold">{a.score}/100</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {a && result && (
            <section className="trail-in grid gap-9 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="font-bold">EXTRACTION</h2>
                <p className="leading-relaxed">{a.summary}</p>
                <table className="w-full">
                  <tbody>
                    {[
                      [
                        'contact',
                        [a.lead.role, a.lead.email, a.lead.phone].filter(Boolean).join(' · ') ||
                          'none stated',
                      ],
                      ['sentiment', a.sentiment],
                      ['next step', a.next_step],
                    ].map(([k, v]) => (
                      <tr key={k as string} className="border-t border-rule align-top">
                        <td className="w-24 py-1.5 pr-3 text-[11px] text-ink-faint">{k}</td>
                        <td className="py-1.5 text-[12.5px] text-ink-soft">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {a.buying_signals.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-[11px] font-bold text-pass">BUYING SIGNALS</h3>
                    <ul className="space-y-0.5 text-[12.5px] text-ink-soft">
                      {a.buying_signals.map((s, i) => (
                        <li key={i}>+ {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {a.objections.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-[11px] font-bold text-clamp">OBJECTIONS</h3>
                    <ul className="space-y-0.5 text-[12.5px] text-ink-soft">
                      {a.objections.map((s, i) => (
                        <li key={i}>- {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {a.action_items.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-[11px] font-bold text-ink-faint">ACTION ITEMS</h3>
                    <table className="w-full">
                      <tbody>
                        {a.action_items.map((item, i) => (
                          <tr key={i} className="border-t border-rule align-top">
                            <td className="w-20 py-1 pr-2 text-[10.5px] font-bold">
                              {item.owner === 'rep' ? '[REP]' : '[PROSPECT]'}
                            </td>
                            <td className="py-1 text-[12.5px] text-ink-soft">
                              {item.task}
                              {item.due_hint ? ` (${item.due_hint})` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="font-bold">GUARDRAILS</h2>
                <div className="hard-card divide-y divide-rule">
                  {result.guardrails.map((g) => (
                    <div key={g.name} className="p-3">
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold">{g.name}</span>
                        <span className={`font-bold ${RAIL_STYLE[g.status]}`}>
                          [{g.status.toUpperCase()}]
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{g.detail}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11.5px] leading-relaxed text-ink-faint">
                  {result.model} · {(result.latencyMs / 1000).toFixed(1)}s · {result.usage.input} in
                  / {result.usage.output} out
                  {result.cached && <span className="font-bold text-ink-soft"> · CACHED FROM A REAL RUN</span>}
                </p>
              </div>
            </section>
          )}

          {!a && !running && (
            <p className="border-2 border-dashed border-ink-faint px-4 py-9 text-center text-ink-faint">
              run the pipeline to see the extraction, the guardrail checks, and the card move
            </p>
          )}
        </div>
      </div>

      <footer className="mt-16 flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-ink pt-4 text-[11.5px] text-ink-faint">
        <span>
          built by{' '}
          <a href="https://github.com/krabhi4" target="_blank" rel="noreferrer">
            Kumar Abhishek
          </a>{' '}
          — Next.js, LLM structured outputs, deterministic guardrails
        </span>
        <span>transcripts are fictional. the API calls are not.</span>
      </footer>
    </main>
  )
}
