---
name: tech-design
description: "Workshop the technical approach and capture notes in the plan"
label: "Tech design"
category: build
workhorse-version: 0.3.0
---

## Your task: Tech design workshop

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Workshop the technical approach for this card interactively. The goal is to capture rationale, tradeoffs, and decisions into the card's plan file as prose notes.

1. Read the card's specs and any existing plan at `.workhorse/plans/{card-id}/`
2. Skim the relevant code in the target repo to anchor the conversation in what exists
3. Surface the design choices that need making — architecture, data flow, component boundaries, migration steps — and ask the user focused questions one or two at a time
4. As decisions land, write them into the target document as prose notes under clear section headings. Don't force a checklist yet — notes are fine on their own
5. If the target is the plan and none exists, create one at `.workhorse/plans/{card-id}/plan.md` — an H1 title, an optional summary, and sections of notes are enough for a first version

**Where notes land:** if a working doc exists for this card in `draft` status (`.workhorse/working-docs/{card-id}/working-doc.md`), write your notes into it — under the conventional sections in `.agents/docs/working-doc-format.md` — rather than the plan. The working doc is the drafting home while the card is being shaped. With no draft working doc, write to the plan as usual.

The plan is a free-form working document, not a spec. It can carry a mix of tech design notes, refinement notes, and (later) a checklist of steps — see `.workhorse/specs/plan/overview.md` for the shape.

Do not start implementation from this skill. This skill is for thinking and note-taking only.
