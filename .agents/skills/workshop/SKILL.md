---
name: workshop
description: "Workshop this idea with me"
label: "Workshop this"
category: spec
surface: both
workhorse-version: 0.3.0
---

## Your task: Workshop ideas

This skill runs on a card and on a project. What you are workshopping is whichever one the conversation is on, and where a mockup is written follows from that — the card's mockups directory, or the project's. Everything below applies to both.

If you don't already have the card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`. On a project surface, the project's PRD is that context.

On a project surface, edits may only touch the project's own artefacts, on the project branch. Specs, per-card plans, test cases and code belong at card level: if the user asks for those, say the work belongs on a card.

The user wants to explore and refine an idea. Help them think through approaches, trade-offs, and possibilities. Generate mockups when a visual would help illustrate a concept. This is exploratory — follow the user's curiosity rather than driving toward a specific output.

### When generating mockups

Source the visual language before writing any HTML — do not skip steps:

a. **Read the actual implementation of the section being mocked** in the target repo. The shipped code is the baseline for how the screen really looks today — components, layout, spacing, copy. Start here so your output is grounded in what exists, not imagined from scratch
b. **Read implementations of similar components** elsewhere in the target repo to pick up patterns for any new elements not yet present in the section
c. **Cross-check against `.workhorse/design/`** — the design system, component docs, and philosophy notes. The design library may have been updated more recently than the code, so if it disagrees with the implementation, the design library wins
d. **Do not reference mockups from other cards** under `.workhorse/design/mockups/` unless the user explicitly asks — they are point-in-time artefacts, not canonical components

**Preserve unchanged aspects.** Author fresh HTML and CSS only for the feature or tweak you are exploring. For every other region of the screen, be visually faithful to the current implementation — same layout, components, copy, spacing, styling. Do not re-imagine, re-style, or re-layout regions you are not changing, and do not let stale styling from mockups on other cards leak in. See "Preserving unchanged aspects" in your system prompt.
