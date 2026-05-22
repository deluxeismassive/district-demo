// scripts/smoke.mjs
// Post-deploy live-URL health check for District Demo Portal.
// Triggered automatically by `npm run deploy` via the `postdeploy` lifecycle hook.
// Node 18+ global fetch — zero npm dependencies.
//
// Exit code 0: all probes passed
// Exit code 1: at least one probe failed after retries (script writes URL to stderr)

const BASE = 'https://deluxeismassive.github.io/district-demo'
const MAX_RETRIES = 5
const RETRY_DELAY_MS = 20_000  // 20s; total max wait ~100s — covers GH Pages CDN propagation
const REQUEST_TIMEOUT_MS = 10_000  // 10s per fetch

// Probe markers are STATIC h1/h2 text from app/pages/*.vue templates — NOT data-driven.
// They survive vendor data edits. Verified against page sources during Phase 13 planning.
const PROBES = [
  { path: '/',          marker: 'Top 8 Vendors Needing Attention', label: 'Dashboard' },
  { path: '/discovery', marker: 'Discovery',                       label: 'Discovery' },
  { path: '/dpa',       marker: 'DPA',                             label: 'DPA' },
  { path: '/risk',      marker: 'Risk Position',                   label: 'Risk Position' },
  { path: '/tags',      marker: 'Tags',                            label: 'Tags' },
]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function probeOnce({ path, marker }) {
  const url = `${BASE}${path}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` }
    const html = await res.text()
    if (!html.includes(marker)) return { ok: false, reason: `marker not found: "${marker}"` }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

async function probeWithRetry(probe) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const result = await probeOnce(probe)
    if (result.ok) {
      console.log(`  PASS  ${probe.label.padEnd(15)} ${BASE}${probe.path}`)
      return true
    }
    if (attempt < MAX_RETRIES) {
      console.log(`  WAIT  ${probe.label.padEnd(15)} attempt ${attempt}/${MAX_RETRIES} — ${result.reason}`)
      await sleep(RETRY_DELAY_MS)
    } else {
      console.error(`  FAIL  ${probe.label.padEnd(15)} ${result.reason}`)
      console.error(`        ${BASE}${probe.path}`)
    }
  }
  return false
}

async function main() {
  console.log(`\nDistrict Demo — post-deploy smoke check`)
  console.log(`Live URL: ${BASE}/\n`)

  let passed = 0
  let failed = 0
  for (const probe of PROBES) {
    const ok = await probeWithRetry(probe)
    ok ? passed++ : failed++
  }

  console.log(`\n${passed}/${PROBES.length} probes passed`)
  if (failed > 0) {
    console.error(`\nERROR: ${failed} probe(s) failed after ${MAX_RETRIES} retries.`)
    console.error(`Site may not be live yet. Check ${BASE}/ manually.`)
    process.exit(1)
  }
}

main()
