---
name: mock-this-up
description: "Produce an HTML mockup for the UI being discussed"
label: "Mock this up"
category: design
workhorse-version: 0.7.2
---

## Your task: Mock this up

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Produce an HTML mockup for the UI being discussed. Skip extended exploration — go straight to the mockup.

1. Identify the target screen from the card description and conversation context
2. **Start from a snapshot where one covers the screen.** The design directory's `snapshots/` folder holds faithful captures of the product's screens, with its real images and fonts. When one covers the screen being mocked, start the mockup with the `start_mockup_from_snapshot` tool where you have it, or otherwise copy the snapshot into the mockups folder and re-point its `../assets/` addresses to where the mockup sits. Then make only the change being discussed, skipping to step 4. Read the implementation as well, for how the screen behaves, since a snapshot records how it looks and not what it does
3. Where no snapshot covers the screen, source the visual language before writing any HTML — do not skip steps:
   a. **Read the actual implementation of the section being mocked** in the target repo. The shipped code is the baseline for how the screen really looks today — components, layout, spacing, copy. Start here so your output is grounded in what exists, not imagined from scratch
   b. **Read implementations of similar components** elsewhere in the target repo to pick up patterns for any new elements not yet present in the section
   c. **Cross-check against `.workhorse/design/`** — the design system, component docs, and philosophy notes. The design library may have been updated more recently than the code, so if it disagrees with the implementation, the design library wins
   d. **Do not reference mockups from other cards** under `.workhorse/design/mockups/` unless the user explicitly asks — they are point-in-time artefacts, not canonical components
4. **Preserve unchanged aspects.** Author fresh HTML and CSS only for the feature or tweak being developed. For every other region of the screen, be visually faithful to the baseline, the snapshot where one covers the screen and otherwise the current implementation — same layout, components, copy, spacing, styling. Do not re-imagine, re-style, or re-layout regions the card is not changing, and do not let stale styling from mockups on other cards leak in. See "Preserving unchanged aspects" in your system prompt
5. Write to `.workhorse/design/mockups/{card-id}/{slug}.html` with inline CSS and an HTML comment header linking to the relevant spec (if one exists). The `{card-id}` folder scopes the mockup to this card, so pre-merge cleanup strips it on merge
   - **A mockup anyone outside the card will need** — because someone else implements it, because it covers several cards' work, or because it is handed on to be picked up later — goes to `.workhorse/design/designs/` instead, where it persists. Its location alone decides whether it survives the merge, so nothing else about the file changes
6. Briefly summarise what you produced
