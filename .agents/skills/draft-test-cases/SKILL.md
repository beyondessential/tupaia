---
name: draft-test-cases
description: "Draft or refine the test-cases checklist for this card"
label: "Draft test cases"
category: verify
workhorse-version: 0.3.0
---

## Your task: Draft test cases

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Produce or refine the card's test-cases checklist — the concrete scenarios that verify this card is done. The file is read by both the tester running scenarios by hand and the implementing agent writing automated tests against them.

1. Read the card's specs in `.workhorse/specs/` and any existing test cases at `.workhorse/test-cases/{card-id}/`
2. Skim the target repo to ground the scenarios in the actual surfaces involved
3. If a test-cases file already exists, edit it in place — add, refine, or reorder scenarios. Don't replace work that still applies
4. If none exists, create one at `.workhorse/test-cases/{card-id}/overview.md` with an H1 title, an optional summary, and one or more checklist sections
5. Write each scenario as one concrete verifiable step in operational voice — a thing to do and the observable outcome. Avoid vague items like "test the feature"
6. Cite the spec id (e.g. "verifies spec: ALG") on scenarios that directly exercise an acceptance criterion. Scenarios without a citation are valid for operational concerns (smoke checks, cross-browser, manual feel)
7. Ask only the clarifying questions you genuinely need — one or two turns at most, not an extended interview

See `.workhorse/specs/test-cases/overview.md` for the file's shape.
