<p align="center">
	<a href="https://tupaia.org">
		<img alt="Tupaia logo" src="https://github.com/beyondessential/tupaia/assets/33956381/314d7a34-b816-474d-a6f3-5ae2698e6b8a" width="158" height="65" />
	</a>
</p>

## Open source info

### Mission statement

> By engaging and collaborating with our community we can deliver a more robust product that bridges cultural differences and empowers decision making within health systems worldwide.

### Community

The [Tupaia Contributing Guidelines](/.github/CONTRIBUTING.md) and [BES Contributor Code of Conduct](/.github/CODE_OF_CONDUCT.md) are published in this repo.

## LLM Agent Usage

For LLM agent setup and usage, see the [LLM Agent System documentation](./llm/README.md).

## Packages

> [!NOTE]
> This is a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md).

It is set up using [Yarn workspaces](https://yarnpkg.com/features/workspaces), meaning any command you would normally run inside a package can be run from the root directory using `yarn workspace @tupaia/package-name command`. For example, `yarn workspace @tupaia/central-server start-dev`.

If you want to watch internal dependencies while running a server, run `yarn workspace @tupaia/package-name start-dev -i`. The `-i` command will listen to changes in the internal dependencies' `dist` folders and restart on changes.
You can also run `build-watch` on these internal dependencies to watch changes and rebuild the package on change. This, combined with `-i` on the server start script will mean anytime you change something in your chosen package, the servers will restart. For example, you could run `yarn workspace @tupaia/central-server start-dev` and also `yarn workspace @tupaia/utils build-watch` which would mean the `central-server` would restart anytime you make a change in `utils`. By default, `central-server`, `datatrak-web-server`, and `tupaia-web-server` have `-i` enabled, for convenience.

Use the `start-stack` command to start all servers needed to run a stack. Available for `admin-panel`, `datatrak`, `lesmis`, `psss` and `tupaia-web`. For example, `yarn start-stack tupaia-web`.

> [!TIP]
> The easiest way to open the packages in VS Code is to open the [tupaia-packages.code-workspace](/tupaia-packages.code-workspace) file. This opens all packages as roots in the workspace, and means linting et al will work correctly.

### Package structure

The Tupaia monorepo has three types of packages:

1. **Platform interfaces.** Front-end [React](https://react.dev) applications that the user interacts with.
2. **Servers.**
   - _Orchestration servers._ Dedicated backend applications for each platform interface.
   - _Micro servers._ Applications which are used by the orchestration servers to perform common system functions.
3. **Libraries.** Various utility and common libraries that are used throughout the monorepo.

While each package type has their own structure, there are a few common standards:

| File                       | Purpose                                                                  |
| :------------------------- | :----------------------------------------------------------------------- |
| `<package>/package.json`   | Package definition                                                       |
| `<package>/src/`           | Contains source code                                                     |
| `<package>/.env.example`   | File showing what environment variables are required by the package      |
| `<package>/.env`           | Environment variables used by package ([ignored by Git](/.gitignore#L1)) |
| `<package>/src/__tests__/` | Contains unit tests                                                      |

### Platform interfaces

- [Tupaia Web](/packages/tupaia-web/README.md)
- [Tupaia DataTrak Web](/packages/datatrak-web/README.md)
- [Admin Panel](/packages/admin-panel/README.md)
- [LESMIS](/packages/lesmis/README.md)
- [PSSS](/packages/psss/README.md)
- [MediTrak](/packages/meditrak-app/README.md)

### Servers

#### Orchestration servers

- [admin-panel-server](/packages/admin-panel-server/README.md)
- [datatrak-web-server](/packages/datatrak-web-server/README.md)
- [lesmis-server](/packages/lesmis-server/README.md)
- [meditrak-app-server](/packages/meditrak-app-server/README.md)
- [psss-server](/packages/psss-server/README.md)
- [tupaia-web-server](/packages/tupaia-web-server/README.md)
- [web-config-server](/packages/web-config-server/README.md) (Tupaia’s orchestration server, referred to as web-config-server for legacy reasons)

#### Micro servers

- [central-server](/packages/central-server/README.md)
- [entity-server](/packages/entity-server/README.md)
- [report-server](/packages/report-server/README.md)
- [data-table-server](/packages/data-table-server/README.md)
- [sync-server](/packages/sync-server/README.md)
- [sync](/packages/sync/README.md)

Server packages can be built by running `yarn workspace @tupaia/package-name build`. Server packages can then be started by running `yarn workspace @tupaia/package-name start`.

All servers are [Node.js](https://nodejs.org)–[Express](https://expressjs.com) applications, and the packages follow the same basic structure:

| File                             | Purpose                                      |
| :------------------------------- | :------------------------------------------- |
| `<package>/examples.http`        | Example queries showing the server interface |
| `<package>/src/index.ts`         | Server entry point                           |
| `<package>/src/app/createApp.ts` | Express router definition                    |
| `<package>/src/routes/`          | Route definitions                            |

### Libraries

- [access-policy](/packages/access-policy/README.md)
- [aggregator](/packages/aggregator/README.md)
- [api-client](/packages/api-client/README.md)
- [auth](/packages/auth/README.md)
- [data-api](/packages/data-api/README.md)
- [data-broker](/packages/data-broker/README.md)
- [data-lake-api](/packages/data-lake-api/README.md)
- [database](/packages/database/README.md)
- [devops](/packages/devops/README.md)
- [dhis-api](/packages/dhis-api/README.md)
- [e2e](/packages/e2e/README.md)
- [expression-parser](/packages/expression-parser/README.md)
- [indicators](/packages/indicators/README.md)
- [server-boilerplate](/packages/server-boilerplate/README.md)
- [server-utils](packages/server-utils/README.md)
- [superset-api](/packages/superset-api/README.md)
- [tsutils](/packages/tsutils/README.md)
- [types](/packages/types/README.md)
- [ui-chart-components](/packages/ui-chart-components/README.md)
- [ui-components](/packages/ui-components/README.md)
- [ui-map-components](/packages/ui-map-components/README.md)
- [utils](/packages/utils/README.md)
- [weather-api](/packages/weather-api/README.md)

## Getting started

Comprehensive setup instructions are available in the [Tupaia dev onboarding](https://beyond-essential.slab.com/posts/tupaia-system-architecture-bx4yroqt) series.

### Secrets

Most packages will require a `.env` file. `.env.example` files indicate the required variables per package. More instructions for setting environment variables are in the [Tupaia monorepo setup](https://beyond-essential.slab.com/posts/tupaia-monorepo-setup-v5egpdpq#hvfnz-set-environment-variables) documentation.

### Development database

Development database setup instructions are in the [Tupaia monorepo setup](https://beyond-essential.slab.com/posts/tupaia-monorepo-setup-v5egpdpq#hs8ne-set-up-database) documentation.

### Dependencies

We use [Yarn Workspaces](https://yarnpkg.com/features/workspaces) to manage our packages, which allows us to run `yarn` once at the project root, and it will install dependencies everywhere.

## CI/CD

We use [GitHub Actions](https://docs.github.com/en/actions) for CI/CD.

## Tests

Most of the packages support the following scripts for testing:

```sh
yarn test
yarn test:coverage  # Also displays code coverage
```

This project is also tested with [BrowserStack](https://www.browserstack.com).

## Style guide

We use a combination of [ESLint configs](https://eslint.org/docs/user-guide/configuring) to detect quality and formatting issues in code:

- [@beyondessential/eslint-config-js](https://www.npmjs.com/package/@beyondessential/eslint-config-js) for JavaScript packages
- [@beyondessential/eslint-config-ts](https://www.npmjs.com/package/@beyondessential/eslint-config-ts) for TypeScript packages
- [@beyondessential/eslint-config-jest](https://www.npmjs.com/package/@beyondessential/eslint-config-jest) for packages using [Jest](https://jestjs.io)

The config for this repository is defined in `.eslintrc` under the root folder. Additional rules/overrides per package are specified in this file.

> [!IMPORTANT]
> Please do not use individual ESLint configs. Update the main configuration file instead.

### Auto-formatting in Visual Studio Code

In order to automatically format code in VS Code according to our style guide:

1. Install [Prettier for VS Code](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).
2. Enable the **Editor: Format on Save** setting: `"editor.formatOnSave": true`.

Your files will now be formatted automatically when you save them
