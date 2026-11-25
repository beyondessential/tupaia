---
workhorse-version: 0.3.0
---

# Spec format and information architecture

Specs are the product-level source of truth for a workspace. The format serves three audiences: product owners and testers authoring them (via interview or direct edit), developers and AI agents implementing from them, and anyone browsing them as a knowledge base.

## Information hierarchy

Specs live in `.workhorse/specs/` as markdown files organised into directories. The directory structure is the hierarchy: **Product > Area > Subarea > ... > Spec**, with arbitrary nesting depth.

```
.workhorse/specs/
├── patient/
│   ├── registration.md
│   ├── allergies.md
│   ├── merge/
│   │   ├── overview.md
│   │   ├── field-resolution.md
│   │   └── conflict-handling.md
│   └── referrals.md
├── scheduling/
│   ├── appointments.md
│   └── recurring-appointments.md
└── labs/
    ├── requests.md
    └── results.md
```

Areas appear as they're needed — there's no predefined list. When drafting a new spec, the agent picks an area consistent with the existing structure. The spec explorer reads this structure from the main branch to build the navigable reference view.

## File format

Each spec is a markdown file with a single-line YAML frontmatter block and a structured body:

```markdown
---
id: ALG
---

# Patient allergies

Summary paragraph describing what this spec covers.

## Section heading

- [ ] Acceptance criterion one
- [ ] Acceptance criterion two
```

The frontmatter carries exactly one field:

- `id` — a short, stable identifier for the spec, used for code-to-spec traceability (see [Spec IDs and code references](#spec-ids-and-code-references))

Nothing else goes in the frontmatter. The title comes from the H1. The area comes from the directory. The originating card isn't recorded on the spec — it's available via git history and doesn't stay tied to the spec after the card closes.

Body structure:

- **Title** — a single `#` H1 at the top, human-readable (e.g. "Patient allergies")
- **Summary** — one or two plain paragraphs below the title, no heading
- **Sections** — `##` headings group related criteria
- **Acceptance criteria** — markdown checkbox items (`- [ ]`)

## Spec IDs and code references

The `id` in frontmatter is a short, stable handle. It lets code reference the spec it implements through inline comments, and survives the spec being renamed or moved.

- IDs are 2–6 character alphanumeric codes, uppercase, chosen when the spec is first created (e.g. `ALG`, `AUTH`, `LAB1`). Use something memorable rather than sequential numbering
- IDs are unique within a workspace. Workhorse checks for collisions on creation
- Once assigned, an ID never changes. The filename or location can change freely — code references keep working
- Code references an implementing spec with an inline comment of the form `// spec: ALG`. For a specific section within the spec, append a kebab-case slug of the heading text: `// spec: ALG#conflict-handling`
- A single piece of code can reference multiple specs with multiple comments — don't try to combine them

Code references are advisory, not load-bearing. They help a reader jump from an implementation detail to the product rule it answers to. Missing references are not a bug.

## Writing conventions

- **Describe the system as it should be, not the changes to make.** Each spec is a coherent snapshot — it reads as "this is how the system works" rather than "change X to Y" or "no longer does Z". No references to "current behaviour", "remains unchanged", "now does", or "rather than the old way". The implementation agent works from the diff to know what's changing.
- **Acceptance criteria are facts about behaviour, not instructions to a developer.**
- **Grade implementation detail by whether it constrains behaviour that must be preserved.** Product-owner-level language is the default: write "the system checks whether all parent cards have been committed" rather than naming the field that tracks commit state, and "Spec complete" rather than an all-caps status constant. But a technical choice belongs in the spec when the choice *is* the requirement — when a reimplementation should be held to it rather than free to pick its own approach. The decision test is: **"Would someone reimplementing this from scratch need to be constrained back to this technical choice?"** If yes, name the detail; the spec is where that constraint is recorded. If no, describe the behaviour and let the implementation choose its tools.
  - **Keep the detail** when it is load-bearing. A sync engine that heals divergence by replaying from a known-good checkpoint must preserve that mechanism, so the spec names it — a different healing strategy would be a different product. Backend and platform specs often carry this kind of detail: data-integrity rules, concurrency and ordering guarantees, wire and storage formats, migration and healing strategies.
  - **Leave it out** when the detail is one acceptable way among several to build the same behaviour. Choosing React hooks to manage state in a frontend workflow is an implementation choice — the user-visible behaviour is the requirement, so specify that and let the build pick its tools. Product-facing, CRUD, and frontend specs stay behavioural.
  - File paths inside `.workhorse/specs/` are always acceptable because they're part of the product's information architecture.
- **Stay within the spec's scope.** Each spec contains only sections that relate directly to its title and area. If content would make more sense in another spec, it belongs there — add a cross-reference (e.g. "see `editor/spec-editor.md`") rather than duplicating or misplacing it. When in doubt, ask: "would someone looking for this information expect to find it in a spec with this title?"
- **Don't specify absences.** Document what the system does, not what it doesn't do. "We don't support X" or "X is not included" is not useful — if it's not in the spec, it's not in the system. If another spec needs updating because this feature changes its behaviour, update that spec declaratively.
- **No point-in-time language.** Don't document transitions ("we used to do X, now we do Y", "this replaces Z"). Each spec is a snapshot of the desired system, not a changelog.
- **No stacking adjectives.** Don't describe behaviour with chains of near-synonyms ("seamless, invisible, frictionless"). Use one precise word or describe the concrete behaviour.
- **No exact measurements in prose.** Pixel widths, animation durations, and precise benchmarks belong in mockups or the design system, not in acceptance criteria. Describe the intent ("compact", "fast enough to feel instant") rather than the number.
- **Open questions must be resolved before a spec is considered done.** A spec with open questions is a draft. Nail them down with the user before committing.
- **Australian/NZ English spelling** (colour, organisation, finalise).

## When a change warrants a spec update

Specs describe product behaviour, so spec edits accompany changes that change product behaviour.

- Product-behaviour changes — new features, removed behaviour, changed flows, revised edge-case handling — require spec edits
- Bug fixes and implementation-detail changes do not require spec edits, unless the bug existed because the spec was unclear, incorrect, or missing. In that case, update the spec first so it reflects the intended behaviour, then fix the code to match
- Refactors and cleanups that leave product behaviour unchanged do not touch specs

## When to edit, fold, create, or split

Default to editing the spec that already covers the concept. A new spec file appears only when the content cannot plausibly live as a section or set of criteria inside any existing spec in the same area.

- **Fold into an existing spec** when the change is a section, criterion, or refinement on a concept the spec already covers. Most spec changes are folds
- **Create a new sibling spec** when the content is a distinct concept within an existing area but does not belong in any current file there
- **Split an existing spec** when it has grown long **and** contains one or more conceptually distinct sub-areas that could each stand alone

When splitting, the parent topic becomes a folder and the sub-topics become files within it:

- Add an `overview.md` when the folder has cross-cutting content (shared terminology, relationships between sub-specs, invariants that apply to all children), or when the folder has more than three siblings and a reader needs orientation
- Skip `overview.md` when two or three well-named siblings speak for themselves
