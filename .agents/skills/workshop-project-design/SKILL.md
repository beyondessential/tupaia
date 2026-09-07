---
name: workshop-project-design
description: "Produce or refine a project-level mockup illustrating a section of the PRD"
label: "Workshop design"
category: design
surface: project
workhorse-version: 0.3.0
---

## Your task: Workshop design (project surface)

Produce or refine a project-level mockup. Project mockups live at `.workhorse/projects/{hash}-{slug}/mockups/{slug}.html` on the project branch — they sit alongside the PRD until a card carries them forward at card-creation time.

### Pick the section first

Project PRDs often contain more than one logical section (component-led or mixed shapes). **If the PRD has more than one section that could plausibly be the target, ask which section the mockup is for** before generating. If there's only one section, or the user has already named it, skip the question and proceed.

### Source the visual language before authoring

Follow the Design sourcing process from your system prompt — do not skip steps:

1. **Read the actual implementation** of the section being mocked in the target repo. The shipped code is the baseline — components, layout, spacing, copy
2. **Read implementations of similar components** elsewhere in the target repo for any new elements not yet present
3. **Cross-check against `.workhorse/design/`** — design system, component docs, philosophy notes. The design library wins on clash
4. **Do not reference mockups from other cards or other projects** as inspiration — they are point-in-time artefacts

### Author and preserve

- Standalone HTML with inline CSS, like card-level mockups
- Author fresh markup only for the feature or area being explored. For every other region of the screen, be visually faithful to the current implementation — same layout, components, copy, spacing, styling
- Do not let stale styling from earlier mockups leak into unchanged regions
- Include an HTML comment header at the top linking to the PRD section being illustrated, e.g. `<!-- prd: components/registration -->`

### How to run

1. Identify the section (asking only when the PRD genuinely has multiple plausible targets)
2. Source the visual language as above
3. Write the file at `.workhorse/projects/{hash}-{slug}/mockups/{slug}.html`
4. Briefly summarise what you produced

### Restrictions on this surface

You are working on the **project surface**, not a card workspace. Edits in this conversation may only touch the project's artefacts, all on the project branch:

- `.workhorse/projects/{hash}-{slug}/prd.md`
- `.workhorse/projects/{hash}-{slug}/mockups/`
- `.workhorse/projects/{hash}-{slug}/breakdown.md`

Do **not** edit specs, per-card plans, test cases, card working docs, or any code. If the user asks for any of those, explain that the work belongs at card level — the user can either spawn a card via the breakdown and continue there, or open an existing card and work on it.

You may **read** anything from the workspace's main branch for context.
