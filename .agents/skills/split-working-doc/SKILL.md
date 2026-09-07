---
name: split-working-doc
description: "Split a working doc into the card's specs, plan, and test cases once its shape is clear"
label: "Split working doc"
category: plan
workhorse-version: 0.3.0
---

## Your task: Split the working doc

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Separate the material in the card's working doc into its long-lived and card-scoped artefacts. Read `.agents/docs/working-doc-format.md` and `.agents/docs/spec-format.md` first.

1. Read the working doc at `.workhorse/working-docs/{card-id}/working-doc.md`.
2. **Check for unresolved open questions.** If any remain, warn the user and ask them to confirm before proceeding — specs can't carry open questions.
3. Fan the material out:
   - Behavioural material → the card's specs, rewritten from working voice into declarative spec voice, following the fold-vs-create rules and writing conventions in `.agents/docs/spec-format.md`. Default to editing existing specs.
   - Implementation options and trade-offs → the plan at `.workhorse/plans/{card-id}/plan.md` (see `.workhorse/specs/plan/overview.md`).
   - Testing notes → the test cases at `.workhorse/test-cases/{card-id}/` (see `.workhorse/specs/test-cases/overview.md`).
4. **Rewrite, don't move** — no working-voice, point-in-time, or open-question material may land in the specs.
5. If the doc has already been split once, reconcile the material into the existing specs, plan, and test cases rather than creating duplicates.
6. Set the working doc's `status` to `complete`. Leave the doc itself in place — it stays as the record of the reasoning.
7. After splitting, remind the user which open questions still need follow-up.

Generate or update mockups for any UI-facing behaviour as part of the split, following the Design sourcing process from your system prompt.
