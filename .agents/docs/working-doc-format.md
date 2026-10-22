---
workhorse-version: 0.3.0
---

# Working doc format

A working doc is a per-card drafting space where spec-level and implementation thinking co-exist before the card is split into its long-lived artefacts (specs, plan, test cases). This doc defines its shape and voice. The artefact itself is specified in `.workhorse/specs/working-doc/overview.md`.

## When to use one

A working doc suits larger, epic-level cards where the shape of the work is still being found and behaviour and implementation need developing side by side. Most cards don't need one — for those, interview straight into specs and let Tech design write to the plan as usual.

## Voice

Unlike a spec, a working doc is written in working voice:

- Open questions are welcome — track them explicitly as you go
- Point-in-time reasoning is welcome ("we considered X but…")
- Implementation detail, options, and trade-offs sit alongside behaviour
- Nothing here has to be a clean declarative snapshot; that transformation happens at the split

## Conventional shape

The file starts minimal — frontmatter (`status: draft`), an H1 title, an overview line. Build the body up under these conventional sections as material accrues. Use only the sections a card needs, and add others when they help.

- **Behaviour** — what the system should do, at spec level: happy paths, edge cases, interactions. This is the material the split rewrites into specs
- **Implementation options** — approaches under consideration, with their shape and cost
- **Open questions** — unresolved decisions, tracked as a checklist so they're easy to see and close off
- **Trade-offs** — the reasoning behind choices, including rejected options and why
- **Testing notes** — scenarios worth verifying, which the split lifts into test cases

## Splitting

When the shape is clear, Split working doc fans the material out:

- Behaviour → the card's specs, rewritten into declarative spec voice per `.agents/docs/spec-format.md`
- Implementation options and trade-offs → the plan
- Testing notes → the test cases

Resolve open questions before splitting where you can — specs can't carry them. Split working doc warns before proceeding if any remain, and reminds you which still need follow-up afterwards.
