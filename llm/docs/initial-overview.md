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
- **Tupaia DataTrak** - Offline PWA for data collection
- **Admin Panel** - Administrative interface for system management
- **MediTrak** - React Native mobile app for field data collection (maintenance only - replaced by DataTrak)
- **LESMIS** - Lao PDR Education and Sports Management Information System (no longer maintained)
- **PSSS** - Pacific Syndromic Surveillance System (no longer maintained)

### 2. Servers

**Orchestration Servers** (dedicated backends for each platform):

- `tupaia-web-server` - Backend for main Tupaia platform
- `datatrak-web-server` - Backend for DataTrak
- `admin-panel-server` - Backend for admin panel
- `web-config-server` - Old backend for Tupaia (retains some legacy functionality)
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

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript and JavaScript
- **Database**: PostgreSQL with custom materialized views (mvrefresh)
- **Testing**: Jest (with coverage), Mocha for some packages

### Frontend

- **Framework**: React
- **UI Library**: Material UI v4, but beginning to adopt v7
- **Styling**: styled-components
- **State Management**: React Query (@tanstack/react-query), Redux (in some apps, moving off)
- **Build Tool**: Vite
- **Testing**: Jest with jsdom

### Database & Data

- **Primary Database**: PostgreSQL
- **Analytics**: Custom materialized view system using pg-mv-fast-refresh
- **Migrations**: db-migrate for schema changes

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

- **Data Element**: Individual data concept (e.g., survey question about x)
- **Data Group**: Grouped set of data elements (e.g., survey)
- **Analytic**: Data point for a data element (e.g., answer to question)
- **Event**: Set of data points for each data element in a group (e.g., survey response)
- **Analytics Table**: Materialized view containing all non-outdated analytics for efficient reporting

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
- `data-lake` - Data lake API (data lake in turn has integrations with Tamanu, mSupply, etc.)
- `kobo` - KoBoToolbox integration
- `superset` - Apache Superset integration
- `weather` - Weather API data

## Important Conventions

### Git Workflow

- **Conventional Commits**: Standard commit message format. This is enforced by by CI: [/.github/workflows/check-pr-title.yaml](/.github/workflows/check-pr-title.yaml)
- **Feature Branches**: Develop on feature branches, merge to dev, then dev is merged to master fortnightly as a "release"
- **Pull Requests**: Required for all changes with code review
- **Issue Tracking**: GitHub Issues and Linear for project management

### Database Conventions

- **Migrations**: Use `yarn migrate-create` for new migrations
- **Models**: Database models in `packages/database/src/modelClasses/`
