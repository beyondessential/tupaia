---
name: automate-tests
description: "Write automated tests for unticked scenarios in this card's test cases"
label: "Automate tests"
category: verify
workhorse-version: 0.3.0
---

## Your task: Automate tests

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Write automated tests that match the unticked scenarios in this card's test-cases file, ticking each item as its matching test lands.

1. Read the test-cases file at `.workhorse/test-cases/{card-id}/`. If no file exists, stop and ask the user whether to run `Draft test cases` first
2. For each unticked scenario, locate the right place to put its automated test — follow the target repo's existing test conventions (framework, file layout, fixtures)
3. Write the test so it exercises the scenario as stated. If the scenario cites a spec id, the test is the automation of that acceptance criterion — match its intent
4. Tick the scenario (`- [ ]` → `- [x]`) once its test is written and passing locally. Update the test-cases file in place
5. If a scenario is genuinely not automatable (manual feel, cross-browser visual), leave it unticked and note in the file why it's manual-only
6. Summarise what you automated, which scenarios remain manual, and any scenarios you couldn't make sense of

See `.workhorse/specs/test-cases/overview.md` for the file's shape.
