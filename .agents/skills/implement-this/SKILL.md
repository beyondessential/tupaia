---
name: implement-this
description: "Implement this card, or carry on from the changes just discussed"
label: "Implement"
category: build
workhorse-version: 0.3.0
---

## Your task: Implement

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Implement the work described by this card. The starting point varies — figure out which one applies before writing code.

**When code changes already exist on the branch, this is usually a continuation rather than a fresh start.** Read the recent conversation first: if the user has just discussed a change, a fix, or a next step, that discussion is what to implement. Pick up from where the branch and the conversation leave off rather than re-reading the whole card and starting again.

### Work out what you're implementing

1. **Is there a pending spec change on this branch?** Diff this card's branch against its upstream base (a card's base is usually `main`, but may be a parent card's branch — check `git rev-parse --abbrev-ref @{upstream}` or the branch's merge-base), scoped to `.workhorse/specs/` and `.workhorse/design/mockups/`. If there are spec or mockup changes, that diff is the source of truth for what you're building — new/changed criteria describe the work
2. **Otherwise, lead with the card description.** Read the title and description carefully — that's what the user wants. Read relevant existing specs in `.workhorse/specs/` for context: how the surrounding behaviour is supposed to work, what conventions and edge cases already exist. Where the description and the existing specs disagree, the description wins — implement to the description, update the affected specs to match, and mention in chat which specs you updated and why
3. **No spec at all?** Fall back to the card title, description, and any conversation context (e.g. a prior workshop or ASCII design chat). Treat concrete decisions from the conversation as the de facto spec and proceed. If the resulting behaviour is substantive and worth keeping in the knowledge base, write it up as a spec change as part of this work — same fold-vs-create rules apply (see `.agents/docs/spec-format.md`)

### The plan

This card may have a plan at `.workhorse/plans/{card-id}/` — a free-form markdown working document with tech design notes and/or a checklist of build steps (see `.workhorse/specs/plan/overview.md`).

- **If a plan with a checklist exists**, work through the checklist in order and tick items off (`- [ ]` → `- [x]`) as you complete them. Expand a step into sub-items if it turns out larger than anticipated. Self-check against the plan as you go and note if the current work has drifted from what the plan says
- **If a plan exists but has notes only**, use the notes as context and draft the checklist yourself as you begin implementation
- **If no plan exists and the work looks multi-stage**, draft a plan at `.workhorse/plans/{card-id}/plan.md` before starting code work, then follow it
- **If the work is a single focused change**, you can skip the plan — proceed directly

### Implementation

- Follow the design system in `.workhorse/design/design-system.md` for any UI work
- Source visual language from the existing implementation first, then `.workhorse/design/` for current direction (`.workhorse/design/` wins on clash). Do not reference mockups from other cards unless the user explicitly asks
- **Preserve unchanged aspects.** Only change the markup and styling for the feature or tweak being implemented. Leave the rest of the screen as it is — same layout, components, copy, spacing, styling — even if you think you can improve it. See "Preserving unchanged aspects" in your system prompt
- Make the code match the acceptance criteria — each criterion should be traceable to code

### Test cases

The card may have a test-cases file at `.workhorse/test-cases/{card-id}/` — the checklist of scenarios that verify the card is done. Treat it as both a live specification of what to test and a running record of what's covered.

- **If a test-cases file exists**, read it alongside the specs so you know what the scenarios are. As you write automated tests that exercise a scenario, tick that scenario off (`- [ ]` → `- [x]`) in the file
- **If no test-cases file exists** and the card has meaningful behaviour worth verifying, create one at `.workhorse/test-cases/{card-id}/overview.md` — an H1 title, optional summary, and checklist sections of concrete scenarios. Cite spec ids on scenarios that verify an acceptance criterion
- **As implementation surfaces new scenarios** (an edge case the specs didn't call out, a regression path worth locking in), append them to the test-cases file
- **Leave uncovered scenarios unticked — don't delete them.** Every case is coverage the card owes, ticked or not. An unticked box records outstanding coverage; leaving it unticked is correct. Remove a case only when the behaviour it verifies no longer exists (typically because a spec changed), never to account for coverage you didn't complete

See `.workhorse/specs/test-cases/overview.md` for the file's shape.

### Spec ambiguity

If while implementing you find the spec is unclear, contradictory, or missing something you need, don't guess. Surface it in chat and propose a spec edit before continuing. Prefer editing the existing spec over creating a new one (see `.agents/docs/spec-format.md`).

If there's no spec and the description/conversation is thin, say so and ask rather than inventing behaviour.
