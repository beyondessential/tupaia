---
name: mock-this-up
description: "Produce an HTML mockup for the UI being discussed"
label: "Mock this up"
category: design
workhorse-version: 0.3.0
---

## Your task: Mock this up

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Produce an HTML mockup for the UI being discussed. Skip extended exploration — go straight to the mockup.

1. Identify the target screen from the card description and conversation context
2. Source the visual language before writing any HTML — do not skip steps:
   a. **Read the actual implementation of the section being mocked** in the target repo. The shipped code is the baseline for how the screen really looks today — components, layout, spacing, copy. Start here so your output is grounded in what exists, not imagined from scratch
   b. **Read implementations of similar components** elsewhere in the target repo to pick up patterns for any new elements not yet present in the section
   c. **Cross-check against `.workhorse/design/`** — the design system, component docs, and philosophy notes. The design library may have been updated more recently than the code, so if it disagrees with the implementation, the design library wins
   d. **Do not reference mockups from other cards** under `.workhorse/design/mockups/` unless the user explicitly asks — they are point-in-time artefacts, not canonical components
3. **Preserve unchanged aspects.** Author fresh HTML and CSS only for the feature or tweak being developed. For every other region of the screen, be visually faithful to the current implementation — same layout, components, copy, spacing, styling. Do not re-imagine, re-style, or re-layout regions the card is not changing, and do not let stale styling from mockups on other cards leak in. See "Preserving unchanged aspects" in your system prompt
4. Decide where the file goes based on the kind of card you're on:
   - **On a product card**, write to `.workhorse/design/mockups/{card-id}/{slug}.html` with inline CSS and an HTML comment header linking to the relevant spec (if one exists). The `{card-id}` folder scopes the mockup to this card so pre-merge cleanup can strip it on merge
   - **On a design card**, write under `.workhorse/design/` directly but outside `mockups/` — pick a meaningful path (e.g. `.workhorse/design/components/{slug}.html` or `.workhorse/design/views/{slug}.html`). The `mockups/` tree holds card scratch and is emptied on merge; a design card's mockup is its deliverable and persists to main, so file it where it belongs long-term
5. Briefly summarise what you produced
