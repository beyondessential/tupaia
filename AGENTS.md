<!-- BEGIN:workhorse 0.3.0 -->
# Workhorse framework

This workspace uses [Workhorse](https://github.com/beyondessential/workhorse), a spec-driven development workbench. Workhorse ships skills (invokable prompts) and reference docs into this repo to shape how AI agents work here.

- **Skills** live at `.agents/skills/` — each skill is a folder containing a `SKILL.md` with YAML frontmatter and a prompt body. `.claude/skills/` is a symlink to the same folder so Claude Code picks them up natively
- **Reference docs** live at `.agents/docs/` — long-form guidance that skill bodies cite by path (spec format conventions and similar)
- **Specs** live at `.workhorse/specs/` — acceptance criteria for each piece of work, organised into areas by subdirectory

When picking up a task, read the skill whose folder name matches what you're being asked to do — its `SKILL.md` describes how to approach the work and which reference docs to follow.

Workhorse keeps this section, the skills, and the reference docs current automatically: the first agent turn of a session smart-merges the latest release over your local edits, so your deliberate changes survive. Edit or remove it freely.
<!-- END:workhorse -->
