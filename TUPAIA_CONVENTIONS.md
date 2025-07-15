# Tupaia Development Conventions

## Branch Naming Rules

### Requirements:
- **Maximum 40 characters**
- **No forward slashes** (`/`) - use dashes instead
- **Cannot end with 'mobile'**
- Use dashes to separate words

### Examples:
✅ **Good:**
- `fix-register-responsive`
- `feat-add-user-dashboard`
- `chore-update-dependencies`

❌ **Bad:**
- `fix/register-center-mobile` (has slash)
- `cursor/center-align-registration-page-on-mobile-d2c8` (too long, has slash, ends with mobile)
- `fix-register-center-mobile` (ends with 'mobile')

## PR Title Format

### Requirements:
- **Must follow Conventional Commit style**
- Pattern: `type(scope): description`
- **Exactly one space** after the colon
- Description should be lowercase

### Regex Check:
The CI validates against: `^\w+(\(\w+\))?:\s`

### Common Types:
- `fix:` - Bug fixes
- `feat:` - New features
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `style:` - Formatting changes
- `refactor:` - Code refactoring
- `test:` - Adding tests

### Examples:
✅ **Good:**
- `fix: center registration page on mobile and update copy`
- `fix(datatrak): center registration page on mobile and update copy`
- `feat(ui-components): add new button variant`
- `chore(deps): update material-ui to latest version`

❌ **Bad:**
- `Fix registration page` (missing type and colon)
- `fix:center registration page` (missing space after colon)
- `fix : center registration page` (space before colon)

## Quick Checklist

### Before pushing a branch:
- [ ] Branch name is under 40 characters
- [ ] Branch name uses dashes, not slashes
- [ ] Branch name doesn't end with 'mobile'

### Before creating a PR:
- [ ] Title starts with valid type (`fix:`, `feat:`, etc.)
- [ ] Title has exactly one space after the colon
- [ ] Title describes the changes clearly
- [ ] Optional: Include scope in parentheses for clarity

## Common Scopes for Tupaia:
- `(datatrak)` - Datatrak web application
- `(ui-components)` - UI component library
- `(central-server)` - Backend server
- `(admin-panel)` - Admin panel application
- `(tupaia-web)` - Main Tupaia web application