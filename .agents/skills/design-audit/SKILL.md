---
name: design-audit
description: "Audit this card's mockups or implementation against the design library"
label: "Design audit"
category: design
workhorse-version: 0.3.0
---

## Your task: Design audit

Audit this card's design work against `.workhorse/design/` — the source of truth for the project's design direction.

### What to audit

Work out what stage the card is at and audit accordingly:

- **Mockups only** (specifying phase — this card has mockups but no UI code) — audit the HTML mockups in `.workhorse/design/mockups/{card-id}/`
- **Implementation** (implementing or reviewing phase — this card has UI code changes) — audit the shipped code on the card's branch
- **Both** — audit both, and flag any places where the implementation drifted from what the mockups showed

### How to audit

1. Read `.workhorse/design/design-system.md` and any other guidance under `.workhorse/design/` (components, philosophy notes)
2. Review against both the high-level principles and the pixel-level detail — use your judgement about what matters for this card
3. Where `.workhorse/design/` disagrees with what's shipped elsewhere in the existing codebase, `.workhorse/design/` wins — it represents the agreed current direction
4. **Flag unchanged aspects that have drifted.** A mockup or implementation should only change the styling and layout of the feature or tweak the card is about — surrounding regions should match the current implementation. Call out any place where unchanged regions have been re-styled or re-imagined, or where stale styling from older mockups (on other cards) has leaked in. See "Preserving unchanged aspects" in your system prompt
5. Do not reference mockups from other cards as inspiration or comparison — each card's mockups are point-in-time artefacts, not canonical components

Post findings as specific, actionable items. Reference the exact design-system rule each finding relates to.
