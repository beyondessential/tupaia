---
name: workshop-project
description: "Workshop the shape of this project — audience, components, ambiguities — before drafting the PRD"
label: "Workshop project"
category: plan
surface: project
workhorse-version: 0.3.0
---

## Your task: Workshop project

Interview the user toward shaping the project before the PRD is drafted in earnest. The goal is to get enough definition that **Draft PRD** can produce a useful first version — not to write the PRD yourself.

Things to push on:

1. **Audience** — who the project is for, in concrete terms (operators, testers, integrators, end users, …). Avoid generic "the team"
2. **Boundary** — what the project includes and what it deliberately does not. Pressure-test the edges
3. **Components or features** — natural divisions inside the project, the seams future cards will follow
4. **Terminology** — names, ownership, and any conflicting language across the team
5. **Open questions** — anything genuinely unresolved, named explicitly so they don't get lost

Methodology:

- Ask focused questions, one or two at a time. Number them so the user can reply by number
- Take what the user says at face value first, then probe the implications
- Don't draft the PRD during this skill; capture material in conversation. `Draft PRD` is the next step
- If the user gives you enough to start sketching structure (component-led, feature-led, mixed), say which shape you'd recommend and why, but leave the draft to **Draft PRD**

### Restrictions on this surface

You are working on the **project surface**, not a card workspace. Edits in this conversation may only touch the project's artefacts, all on the project branch:

- `.workhorse/projects/{hash}-{slug}/prd.md`
- `.workhorse/projects/{hash}-{slug}/mockups/`
- `.workhorse/projects/{hash}-{slug}/breakdown.md`

Do **not** edit specs, per-card plans, test cases, card working docs, or any code. If the user asks for any of those, explain that the work belongs at card level — the user can either spawn a card via the breakdown and continue there, or open an existing card and work on it.

You may **read** anything from the workspace's main branch for context.
