# Tupaia

## Open Source Info

### Open Source Mission statement

> By engaging and collaborating with our community we can deliver a more robust product that bridges cultural differences and empowers decision making within health systems worldwide.

### Code of Conduct

Our contributor’s [code of conduct](/.github/CODE_OF_CONDUCT.md) is published in this repo.

## Packages

> [!NOTE]  
> This is a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md).

It is set up using `yarn workspaces`, meaning any command you would normally run inside a package can be run from the root directory using `yarn workspace @tupaia/package-name command`. For example:

```sh
yarn workspace @tupaia/central-server start-dev
```

Use the `start-stack` command

> [!TIP]
> The easiest way to open the packages in VS Code is to open the [tupaia-packages.code-workspace](/tupaia-packages.code-workspace) file. This opens all packages as roots in the workspace, and means linting et al will work correctly.

### Package structure

The Tupaia monorepo is comprised of three types of packages:

1. **Platform interfaces.** Front-end React applications that the user interacts with.
2. **Servers.**
	- *Orchestration servers.* Dedicated backend applications for each platform interface.
	- *Micro servers.* Applications which are used by the orchestration servers to perform common system functions.
3. **Libraries.** Various utility and common libraries that are used throughout the monorepo.

While each package type has their own structure, there are a few common standards:

- `<package>/package.json` – package definition
- `<package>/src/` – contains source code
- `<package>/.env.example` – file showing what environment variables are required by the package
- `<package>/.env` – environment variables used by package (ignored in git)
- `<package>/src/__tests__/` – contains unit tests

### Platform interfaces

- [Tupaia](https://github.com/beyondessential/tupaia/blob/dev/packages/web-frontend/README.md) (for legacy reasons referred to as web-frontend)
- [Tupaia Web](https://github.com/beyondessential/tupaia/blob/dev/packages/tupaia-web/README.md) (New version of web-frontend)
- [Tupaia Datatrak Web](https://github.com/beyondessential/tupaia/blob/dev/packages/datatrak-web/README.md)
- [Admin Panel](https://github.com/beyondessential/tupaia/blob/dev/packages/admin-panel/README.md)
- [LESMIS](https://github.com/beyondessential/tupaia/blob/dev/packages/lesmis/README.md)
- [PSSS](https://github.com/beyondessential/tupaia/blob/dev/packages/psss/README.md)
- [Meditrak](https://github.com/beyondessential/tupaia/blob/dev/packages/meditrak-app/README.md)

### Servers

#### Orchestration servers

- [web-config-server](https://github.com/beyondessential/tupaia/blob/dev/packages/web-config-server/README.md) (Tupaia's orchestration server, referred to as web-config-server for legacy reasons)
- [admin-panel-server](https://github.com/beyondessential/tupaia/blob/dev/packages/admin-panel-server/README.md)
- [lesmis-server](https://github.com/beyondessential/tupaia/blob/dev/packages/lesmis-server/README.md)
- [psss-server](https://github.com/beyondessential/tupaia/blob/dev/packages/psss-server/README.md)
- [meditrak-app-server](https://github.com/beyondessential/tupaia/blob/dev/packages/meditrak-app-server/README.md)

#### Micro servers

- [central-server](https://github.com/beyondessential/tupaia/blob/dev/packages/central-server/README.md)
- [entity-server](https://github.com/beyondessential/tupaia/blob/dev/packages/entity-server/README.md)
- [report-server](https://github.com/beyondessential/tupaia/blob/dev/packages/report-server/README.md)
- [data-table-server](https://github.com/beyondessential/tupaia/blob/dev/packages/data-table-server/README.md)

Server packages can be built by running `yarn workspace @tupaia/package-name build`. Server packages can then be started by running `yarn workspace @tupaia/package-name start`.

All servers are Node.js express applications, and the packages follow the same basic structure:

- `<package>/examples.http` – example queries showing the server interface
- `<package>/src/index.ts` – server entry point
- `<package>/src/app/createApp.ts` – express router definition
- `<package>/src/routes/` – route definitions

### Libraries

- [access-policy](https://github.com/beyondessential/tupaia/blob/dev/packages/access-policy/README.md)
- [aggregator](https://github.com/beyondessential/tupaia/blob/dev/packages/aggregator/README.md)
- [api-client](https://github.com/beyondessential/tupaia/blob/dev/packages/api-client/README.md)
- [auth](https://github.com/beyondessential/tupaia/blob/dev/packages/auth/README.md)
- [data-api](https://github.com/beyondessential/tupaia/blob/dev/packages/data-api/README.md)
- [data-broker](https://github.com/beyondessential/tupaia/blob/dev/packages/data-broker/README.md)
- [data-lake-api](https://github.com/beyondessential/tupaia/blob/dev/packages/data-lake-api/README.md)
- [database](https://github.com/beyondessential/tupaia/blob/dev/packages/database/README.md)
- [devops](https://github.com/beyondessential/tupaia/blob/dev/packages/devops/README.md)
- [dhis-api](https://github.com/beyondessential/tupaia/blob/dev/packages/dhis-api/README.md)
- [e2e](https://github.com/beyondessential/tupaia/blob/dev/packages/e2e/README.md)
- [expression-parser](https://github.com/beyondessential/tupaia/blob/dev/packages/expression-parser/README.md)
- [indicators](https://github.com/beyondessential/tupaia/blob/dev/packages/indicators/README.md)
- [ui-components](https://github.com/beyondessential/tupaia/blob/dev/packages/ui-components/README.md)
- [ui-chart-components](https://github.com/beyondessential/tupaia/blob/dev/packages/ui-chart-components/README.md)
- [ui-map-components](https://github.com/beyondessential/tupaia/blob/dev/packages/ui-map-components/README.md)
- [server-boilerplate](https://github.com/beyondessential/tupaia/blob/dev/packages/server-boilerplate/README.md)
- [superset-api](https://github.com/beyondessential/tupaia/blob/dev/packages/superset-api/README.md)
- [ui-components](https://github.com/beyondessential/tupaia/blob/dev/packages/ui-components/README.md)
- [utils](https://github.com/beyondessential/tupaia/blob/dev/packages/utils/README.md)
- [tsutils](https://github.com/beyondessential/tupaia/blob/dev/packages/tsutils/README.md)
- [types](https://github.com/beyondessential/tupaia/blob/dev/packages/types/README.md)
- [weather-api](https://github.com/beyondessential/tupaia/blob/dev/packages/weather-api/README.md)

## Getting started

### Secrets

Most packages will require a .env file. `.env.example` files indicate the required variables per package.

🔑 **BES internal:** [Adding .env files](https://beyond-essential.slab.com/posts/tupaia-monorepo-setup-v5egpdpq#step-3-add-env-files)

### Local database

🔑 **BES internal:** [Tupaia monorepo setup](https://beyond-essential.slab.com/posts/tupaia-monorepo-setup-v5egpdpq) – steps 4 and 5

### Dependencies

We use yarn workspaces to manage our packages, which allows us to run `yarn` once at the project
root, and it will install dependencies everywhere.

## CI/CD

We use [GitHub Actions](https://docs.github.com/en/actions) for the CI/CD.

## Tests

Most of the packages support the following scripts for testing:

```sh
yarn test
yarn test:coverage  # Also displays code coverage
```

## Style Guide

We use a combination of [ESlint configs](https://eslint.org/docs/user-guide/configuring) to detect quality and formatting issues in code:

- [@beyondessential/eslint-config-js](https://www.npmjs.com/package/@beyondessential/eslint-config-js) for JavaScript packages
- [@beyondessential/eslint-config-ts](https://www.npmjs.com/package/@beyondessential/eslint-config-ts) for TypeScript packages
- [@beyondessential/eslint-config-jest](https://www.npmjs.com/package/@beyondessential/eslint-config-jest) for packages using `Jest`

The config for this repository is defined in `.eslintrc` under the root folder. Additional rules/overrides per package are specified in this file.

> [!IMPORTANT]
> Please do not use individual ESLint configs, but update the main configuration file instead.

### Auto-formatting in Visual Studio Code

In order to automatically format code in VS Code according to our style guide:

1. Install [Prettier for VS Code](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2. Enable the `Editor: Format on Save` setting
3. Your files will now be formatted automatically when you save them

---

This project is tested with [Browserstack](https://www.browserstack.com/)
