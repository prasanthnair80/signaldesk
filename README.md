# SignalDesk — Webhook Classification & Correlation Service

SignalDesk receives webhook events from multiple SaaS integrations (Stripe, GitHub, PagerDuty, and others), classifies each event into one of five internal categories (`billing`, `auth`, `usage`, `error`, `config`), and detects correlated incident signals when multiple related events arrive within a short time window.

## Setup

```bash
cd backend
npm install
npm test
```

Running `npm test` will show **3 failing tests** to start. Your goal is to make them all pass.

---

## The Exercise — Three Parts

### Part 1 — Fix the bug (~15 min)

One test is failing because of a bug in `src/classifier.ts`. Find the source of the bug and fix it. The test output will tell you which test is failing and what was expected.

### Part 2 — Implement `detectCorrelation` (~30 min)

Two tests are failing because `src/correlator.ts` contains a stub that always returns `null`. Implement the `detectCorrelation` function so both tests pass.

The function signature, behaviour contract, and implementation hints are in the file. Read the existing tests in `tests/correlator.test.ts` to understand exactly what is expected.

### Part 3 — Code review `src/summarizer.ts` (~20 min)

No code changes required for this part. Read `src/summarizer.ts` carefully and be prepared to discuss:

- What would you change, and why?
- Are there any calls in this file that concern you from a reliability, cost, or correctness standpoint?

Come ready to talk through your reasoning. There are no trick questions — just explain what you see.

---

## Project Structure

```
backend/
  src/
    types.ts          — shared TypeScript types
    classifier.ts     — event classification logic
    correlator.ts     — correlation detection (stub to implement)
    summarizer.ts     — incident summary generation (code review)
    store.ts          — in-memory event store
  tests/
    classifier.test.ts
    correlator.test.ts
  package.json
  tsconfig.json
  tsconfig.test.json
```
