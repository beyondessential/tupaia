# Tupaia Project-Specific Rules

## Current Status

Most rules are handled by shared common rules. This file contains minimal Tupaia-specific guidance.

## Essential Tupaia Patterns

### Package Development

- Use `@tupaia/` namespace for all packages
- Follow established patterns in `packages/` directory
- Include `.env.example` files for environment variables

### Database Changes

- All schema changes go through `packages/database/` migration system
- Consider analytics table impact when modifying data structures

### API Development

- Follow orchestration vs micro server patterns
- Use `server-boilerplate` package for new servers
- Integrate with `data-broker` for external data sources

---

_Project-specific rules will be added here as Tupaia-specific requirements are identified._
