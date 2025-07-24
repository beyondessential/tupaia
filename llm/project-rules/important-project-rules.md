# Tupaia Project-Specific Rules

## Current Status

This file is currently minimal as most rules are handled by the shared common rules. Project-specific rules will be added here as needed for Tupaia-specific requirements that differ from or extend the shared rules.

## When to Add Rules Here

Add rules to this file when:

- **Tupaia-specific workflows** differ from standard patterns
- **Domain-specific requirements** for health data platforms apply
- **Monorepo-specific conventions** unique to Tupaia's 30+ package structure
- **Integration requirements** for DHIS2, KoBoToolbox, or other health systems
- **Deployment or environment** requirements specific to Tupaia's infrastructure
- **Code patterns** that are unique to Tupaia's architecture

## Rule Categories to Consider

### Code Organisation

- Package interdependency rules
- Internal vs external package usage patterns
- Migration and database change procedures

### Domain-Specific Patterns

- Entity hierarchy handling conventions
- Health data privacy and security requirements
- Analytics and reporting data transformation standards

### Integration Guidelines

- External health system integration patterns
- API versioning and backward compatibility requirements
- Data synchronisation and conflict resolution approaches

### Development Environment

- Environment variable management across 30+ packages
- Local development stack setup procedures
- Testing strategies for health data scenarios

## Adding New Rules

When adding rules to this file:

1. **Check common rules first** - ensure the rule isn't better placed in shared rules
2. **Use clear headings** - organise by functional area or workflow
3. **Provide context** - explain why the rule is Tupaia-specific
4. **Include examples** - show practical applications where relevant
5. **Reference related files** - link to relevant package documentation

## Current Project-Specific Guidance

### Package Development

- When creating new packages, follow the established patterns in `packages/` directory
- Use `@tupaia/` namespace for all new packages
- Include comprehensive `.env.example` files for environment variables

### Database Changes

- All schema changes must go through the migration system in `packages/database/`
- Consider analytics table impact when modifying data structures
- Test migrations against both development and staging environments

### API Development

- Follow the established server patterns (orchestration vs micro servers)
- Use the shared `server-boilerplate` package for new servers
- Ensure proper integration with the `data-broker` for external data sources

---

_This file will be expanded as Tupaia-specific patterns and requirements are identified that differ from the shared common rules._
