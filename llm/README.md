# LLM Agent System

This directory contains the LLM agent rules and documentation for Tupaia.

## Structure

- `docs/` - Project-specific documentation and context
- `project-rules/` - Tupaia-specific LLM agent rules
- `common-rules/` - Shared LLM rules (Git submodule from [beyondessential/llm-rules](https://github.com/beyondessential/llm-rules))

## Usage

LLM agents should start by loading `llm/common-rules/onboard-agent.md`. This will start a standard onboarding that in turn loads docs like the project overview and important rules.

## Rule Priority

When rules conflict:

1. Project-specific rules (`project-rules/`) take highest priority
2. Shared rules (`common-rules/`) provide the foundation
3. Always prioritise project-specific rules over generic ones

## Working with the Submodule

For detailed submodule usage instructions (setup, updating, contributing), see the [common-rules README](./common-rules/README.md).

### Adding New Rules

**For Tupaia-specific rules:** Add them to `llm/project-rules/`

**For rules that could benefit other projects:** Add them to the shared repository via the submodule (see common-rules README for the process)
