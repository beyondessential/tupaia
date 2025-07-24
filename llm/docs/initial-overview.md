# Tupaia Project - Initial Overview

## Project Purpose

Tupaia is an open-source health data platform focused on mapping and analyzing health data across the Pacific region. Developed by Beyond Essential Systems (BES), Tupaia's mission is to bridge cultural differences and empower decision-making within health systems worldwide, particularly in remote and underserved areas.

**Key Focus Areas:**

- Health data aggregation, analysis, and visualization
- Pacific region health systems (countries, districts, facilities)
- Remote settings data collection and management
- Multi-platform health information systems
- Real-time health surveillance and reporting

## Architecture Overview

Tupaia follows a **microservices architecture** built as a **yarn workspaces monorepo** with 30+ packages organized into three main categories:

### 1. Platform Interfaces (Frontend Applications)

React-based web applications that users interact with:

- **Tupaia Web** - Main data visualization platform (tupaia.org)
- **Tupaia DataTrak Web** - Data collection interface
- **Admin Panel** - Administrative interface for system management
- **LESMIS** - Lao PDR Education and Sports Management Information System
- **PSSS** - Pacific Syndromic Surveillance System
- **MediTrak** - React Native mobile app for field data collection

### 2. Servers

**Orchestration Servers** (dedicated backends for each platform):

- `tupaia-web-server` - Backend for main Tupaia platform
- `datatrak-web-server` - Backend for DataTrak
- `admin-panel-server` - Backend for admin panel
- `web-config-server` - Core orchestration server (legacy name)
- `lesmis-server`, `psss-server`, `meditrak-app-server`

**Micro Servers** (shared system functions):

- `central-server` - Primary microservice for CRUD operations, authentication, survey management
- `entity-server` - Entity and hierarchy management
- `report-server` - Report building and data transformation
- `data-table-server` - Data table operations

### 3. Libraries

Common packages used across the system:

- `database` - PostgreSQL database models and migrations
- `data-broker` - Centralized gateway to external data sources
- `data-api` - Analytics table and data fetching
- `ui-components` - Shared React components
- `ui-chart-components` - Chart visualization components
- `ui-map-components` - Map-related components
- `auth` - Authentication and authorization
- `utils` - Common utilities
- `types` - TypeScript type definitions

## Technology Stack

### Backend

- **Runtime**: Node.js 20.11.1
- **Framework**: Express.js
- **Language**: TypeScript and JavaScript
- **Database**: PostgreSQL with custom materialized views (mvrefresh)
- **Package Manager**: Yarn 3 (Berry)
- **Process Manager**: PM2 for development stacks
- **Testing**: Jest (with coverage), Mocha for some packages

### Frontend

- **Framework**: React 16 (legacy version for compatibility)
- **UI Library**: Material-UI v4
- **Styling**: styled-components
- **State Management**: React Query (@tanstack/react-query), Redux (in some apps)
- **Routing**: React Router v6
- **Maps**: Leaflet with React Leaflet
- **Build Tool**: Vite
- **Testing**: Jest with jsdom

### Database & Data

- **Primary Database**: PostgreSQL
- **Analytics**: Custom materialized view system using pg-mv-fast-refresh
- **Migrations**: db-migrate for schema changes
- **External APIs**: DHIS2, KoBoToolbox, Superset, Weather APIs

### Development Tools

- **Linting**: ESLint with BES custom configs
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions
- **Documentation**: Storybook for component documentation
- **Monorepo**: Yarn workspaces with custom scripts

## Key Concepts

### Entities

Core concept representing fixed geographical locations arranged in hierarchies:

- **Types**: world, project, country, district, sub_district, facility, village, household, individual, school, etc.
- **Hierarchies**: Countries contain districts, districts contain facilities, etc.
- **Project-specific**: Different projects can have different entity hierarchies

### Data Elements & Analytics

- **Data Element**: Individual data point type (e.g., survey question)
- **Data Group**: Grouped set of data elements (e.g., survey)
- **Analytic**: Data point for a data element (e.g., answer to question)
- **Event**: Set of data points for each data element in a group (e.g., survey response)
- **Analytics Table**: Materialized view containing all non-outdated analytics

### Reports & Visualizations

- **Reports**: Config-driven data transformations using transformation functions
- **Transformation Functions**: Operations like `insertColumns`, `excludeRows` for table manipulation
- **Map Overlays**: Geographic data visualizations
- **Dashboards**: Collections of reports and visualizations

### Data Broker Services

Centralized gateway supporting multiple external data sources:

- `tupaia` - Internal Tupaia data
- `dhis` - DHIS2 integration
- `indicator` - Calculated indicators
- `data-lake` - Data lake API
- `kobo` - KoBoToolbox integration
- `superset` - Apache Superset integration
- `weather` - Weather API data

## Codebase Structure

### Root Level

```
tupaia/
├── packages/           # All 30+ packages in yarn workspace
├── scripts/           # Build and development scripts
├── env/              # Environment variable examples
├── .storybook/       # Storybook configuration
└── *.config.*        # Various config files (Jest, Babel, ESLint, etc.)
```

### Package Structure Standards

Each package follows consistent patterns:

```
package/
├── package.json      # Package definition
├── src/             # Source code
├── .env.example     # Required environment variables
├── .env             # Local environment (gitignored)
└── src/__tests__/   # Unit tests
```

### Server Package Structure

```
server-package/
├── examples.http         # API endpoint examples
├── src/index.ts         # Entry point
├── src/app/createApp.ts # Express router definition
└── src/routes/          # Route definitions
```

## Development Workflow

### Environment Setup

1. **Node.js**: Required version 20.11.1 (see `.nvmrc`)
2. **Yarn**: Yarn 3 (Berry) for package management
3. **Database**: PostgreSQL with development database setup
4. **Environment Variables**: Each package requires `.env` file based on `.env.example`

### Common Commands

```bash
# Install all dependencies
yarn

# Start default stack (tupaia-web)
yarn start-dev

# Start specific stack
yarn start-stack <stack-name>  # admin-panel, datatrak, lesmis, psss, tupaia-web

# Build all packages
yarn build

# Run tests
yarn test-all

# Database operations
yarn migrate              # Run migrations
yarn refresh-database     # Refresh development database
```

### Workspace Commands

Run package-specific commands from root:

```bash
yarn workspace @tupaia/package-name command

# Examples:
yarn workspace @tupaia/central-server start-dev
yarn workspace @tupaia/tupaia-web build
yarn workspace @tupaia/database migrate
```

### Development Patterns

- **Internal Dependencies**: Use `start-dev -i` to watch internal dependency changes
- **Build Watch**: Use `build-watch` on dependencies to auto-rebuild
- **Stack Development**: Use `start-stack` to run all required servers for a platform
- **VS Code**: Open `tupaia-packages.code-workspace` for optimal development experience

## Important Conventions

### Code Standards

- **ESLint**: BES custom configs for JavaScript, TypeScript, and Jest
- **Prettier**: Auto-formatting on save
- **Package Naming**: All packages prefixed with `@tupaia/`
- **Imports**: Use workspace internal dependencies via `workspace:*`

### Git Workflow

- **Conventional Commits**: Standard commit message format
- **Feature Branches**: Develop on feature branches, merge to master
- **Pull Requests**: Required for all changes with code review
- **Issue Tracking**: GitHub Issues and Linear for project management

### Database Conventions

- **Migrations**: Use `yarn migrate-create` for new migrations
- **Models**: Database models in `packages/database/src/modelClasses/`
- **Analytics**: Materialized views for performance via mvrefresh
- **Entity Types**: Extensible enum in database for new entity types

### API Conventions

- **RESTful APIs**: Standard REST patterns
- **Express Routers**: Modular route definitions
- **Authentication**: JWT tokens with refresh token support
- **Error Handling**: Centralized error handling middleware
- **API Versioning**: `/api/v1`, `/api/v2` patterns

## Key Files and Directories

### Configuration Files

- `package.json` - Root workspace configuration
- `babel.config.json` - Babel transpilation settings
- `jest.config-*.json` - Testing configurations
- `tsconfig-*.json` - TypeScript configurations
- `.eslintrc-*.json` - Linting rules
- `vite.config.js` - Frontend build configuration

### Database

- `packages/database/src/migrations/` - Database schema migrations
- `packages/database/src/modelClasses/` - Database model definitions
- `packages/database/schema/` - Database schema files

### Core Packages

- `packages/central-server/` - Main backend server
- `packages/tupaia-web/` - Main frontend application
- `packages/database/` - Database layer
- `packages/ui-components/` - Shared UI components
- `packages/data-broker/` - Data integration layer

### Development Scripts

- `scripts/bash/` - Shell scripts for building and deployment
- `scripts/node/` - Node.js utility scripts

## External Integrations

### DHIS2

- Health Information System integration
- Organization unit and data synchronization
- Data export/import capabilities

### KoBoToolbox

- Survey data collection platform
- Form management and data extraction

### Apache Superset

- Business intelligence and data visualization
- Dashboard and chart integration

### Geographic Services

- Mapbox for mapping services
- GeoJSON for geographic data representation
- Leaflet for interactive maps

## Development Environment

### Recommended Setup

1. **IDE**: VS Code with workspace file for optimal package management
2. **Database**: Local PostgreSQL instance
3. **Environment**: Use provided `.env.example` files
4. **Documentation**: Comprehensive dev onboarding available in internal docs

### Testing Strategy

- **Unit Tests**: Jest for most packages
- **Integration Tests**: Database-connected tests where needed
- **E2E Tests**: Cypress for end-to-end testing
- **Coverage**: Coverage reporting available via `yarn test:coverage`

This overview provides the foundational knowledge needed to understand and work with the Tupaia codebase effectively.
