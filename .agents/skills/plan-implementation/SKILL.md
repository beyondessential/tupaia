---
name: plan-implementation
description: "Draft or refine the implementation checklist from specs and current code"
label: "Plan implementation"
category: build
workhorse-version: 0.3.0
---

## Your task: Plan implementation

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Draft or refine the implementation checklist in the card's plan file. The plan turns the card's specs and any existing tech notes into a sequenced checklist of steps that `Implement this` can then work through.

1. Read the card's specs and any existing plan at `.workhorse/plans/{card-id}/`
2. Skim the target repo to ground the steps in the existing code
3. If a plan already exists, edit it in place — add, refine, or reorder checklist sections around the existing prose notes. Don't replace notes
4. If no plan exists, create one at `.workhorse/plans/{card-id}/plan.md` with an H1 title, a short summary, and one or more checklist sections
5. Each checklist item should be a concrete step — a file to change, a feature to wire up, a migration to author. Avoid vague items like "add tests"
6. Ask only the clarifying questions you genuinely need to produce a useful plan — the expectation is one or two turns, not an extended interview

The plan is a free-form working document, not a spec — checkboxes describe build steps, not product behaviour. See `.workhorse/specs/plan/overview.md`.
