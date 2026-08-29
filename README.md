# AfterCall

Paste a sales-call transcript and watch it become CRM data: a lead score, a pipeline stage, action items with owners, objections, and buying signals. The deal card then moves across a six-stage board, but only after four checks written in plain code have gone over what the model returned.

The point of the demo is that second part. Getting an LLM to output JSON is easy; the work is deciding what to trust. AfterCall treats the model as a proposal generator and the code as the authority.

## The four guardrails

1. Schema validation. The response must parse against a strict Zod schema (score 0-100, enums for stage and temperature, typed action items). A malformed response is rejected, not repaired.
2. Stage transition legality. The pipeline has a transition map: a deal in Demo Scheduled can move to Proposal Sent, back to Qualified, or to Closed Lost, and nowhere else. If the model proposes a jump the map forbids, the code clamps it to a legal move and says so on screen.
3. Score consistency. The model must call a lead hot (70+), warm (40-69), or cold (below 40). A score of 85 labeled "cold" gets flagged for human review instead of accepted.
4. Contact provenance. Every extracted email and phone number must appear verbatim in the transcript. Anything else is flagged as invented.

## Cost design

The three sample transcripts return cached JSON from real model runs, so a public deployment serves any amount of traffic for $0. Only a pasted custom transcript calls the API live, and it runs on Gemini's free tier (`gemini-2.5-flash` by default, overridable with `GEMINI_MODEL`).

## Run it

```bash
pnpm install
cp .env.example .env   # GEMINI_API_KEY: free key from https://aistudio.google.com/apikey
pnpm dev
```

To regenerate the cached fixtures after editing the samples or the prompt:

```bash
pnpm dlx tsx --env-file=.env scripts/generate-fixtures.mts
```

## Stack

Next.js 16, TypeScript, Tailwind 4, Zod 4, Google Gen AI SDK.

## Author

Kumar Abhishek. I build voice agents, LLM pipelines, and the boring API plumbing that makes them trustworthy. [github.com/krabhi4](https://github.com/krabhi4)
