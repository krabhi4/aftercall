import { promises as fs } from 'fs'
import path from 'path'
import { runAnalysis } from '../lib/analyze'
import { SAMPLES } from '../lib/samples'

const outDir = path.join(process.cwd(), 'lib', 'fixtures')
await fs.mkdir(outDir, { recursive: true })

for (const sample of SAMPLES) {
  process.stdout.write(`${sample.id}... `)
  const run = await runAnalysis(sample.transcript, sample.currentStage)
  await fs.writeFile(path.join(outDir, `${sample.id}.json`), JSON.stringify(run, null, 2))
  console.log(`ok (${run.finalStage}, score ${run.analysis.score}, ${run.latencyMs}ms)`)
}
console.log('Fixtures written to lib/fixtures/')
