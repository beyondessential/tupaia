# Tupaia

[![Codeship Status for beyondessential/tupaia#dev](https://app.codeship.com/projects/70159bc0-0dac-0138-fdcb-260b82737f4e/status?branch=dev)](https://app.codeship.com/projects/379708)

> This is a [mono-repo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)

It is set up using `yarn workspaces`, meaning any command you would normally run inside a package can
be run from the root directory using `yarn workspace @tupaia/package-name command`, e.g.
`yarn workspace @tupaia/central-server start-dev`

## Packages

The easiest way to open the packages in vscode is to double click 'tupaia-packages.code-workspace'.
This opens all packages as roots in the workspace, and means linting etc. will work correctly.

### Main packages

- [admin-panel](https://github.com/beyondessential/tupaia/blob/dev/packages/admin-panel/README.md)
- [admin-panel-server](https://github.com/beyondessential/tupaia/blob/dev/packages/admin-panel-server/README.md)
- [central-server](https://github.com/beyondessential/tupaia/blob/dev/packages/central-server/README.md)
- [lesmis](https://github.com/beyondessential/tupaia/blob/dev/packages/lesmis/README.md)
- [lesmis-server](https://github.com/beyondessential/tupaia/blob/dev/packages/lesmis-server/README.md)
- [meditrak-app](https://github.com/beyondessential/tupaia/blob/dev/packages/meditrak-app/README.md)
- [meditrak-app-server](https://github.com/beyondessential/tupaia/blob/dev/packages/meditrak-app-server/README.md)
- [psss](https://github.com/beyondessential/tupaia/blob/dev/packages/psss/README.md)
- [psss-server](https://github.com/beyondessential/tupaia/blob/dev/packages/psss-server/README.md)
- [web-config-server](https://github.com/beyondessential/tupaia/blob/dev/packages/web-config-server/README.md)
- [web-frontend](https://github.com/beyondessential/tupaia/blob/dev/packages/web-frontend/README.md)

Any of the main packages can be run using `yarn workspace @tupaia/package-name start-dev`.
In the case of the two servers, this will also build and watch all of the internal dependencies, so
that hot reload detects changes to other packages within the mono-repo. As this delays startup time,
if you prefer to pre-build internal dependencies, add `--skip-internal` to the above command.

### Internal dependencies

- [access-policy](https://github.com/beyondessential/tupaia/blob/dev/packages/access-policy/README.md)
- [aggregator](https://github.com/beyondessential/tupaia/blob/dev/packages/aggregator/README.md)
- [auth](https://github.com/beyondessential/tupaia/blob/dev/packages/auth/README.md)
- [database](https://github.com/beyondessential/tupaia/blob/dev/packages/database/README.md)
- [data-broker](https://github.com/beyondessential/tupaia/blob/dev/packages/data-broker/README.md)
- [devops](https://github.com/beyondessential/tupaia/blob/dev/packages/devops/README.md)
- [dhis-api](https://github.com/beyondessential/tupaia/blob/dev/packages/dhis-api/README.md)
- [expression-parser](https://github.com/beyondessential/tupaia/blob/dev/packages/expression-parser/README.md)
- [indicators](https://github.com/beyondessential/tupaia/blob/dev/packages/indicators/README.md)
- [ui-components](https://github.com/beyondessential/tupaia/blob/dev/packages/ui-components/README.md)
- [server-boilerplate](https://github.com/beyondessential/tupaia/blob/dev/packages/server-boilerplate/README.md)
- [utils](https://github.com/beyondessential/tupaia/blob/dev/packages/utils/README.md)

## Getting started

### Secrets

Most packages will require a .env file. `.env.example` files indicate the required variables per package.

🔑 **BES internal:** [Adding .env files](https://beyond-essential.slab.com/posts/tupaia-monorepo-setup-v5egpdpq#step-3-add-env-files)

### Local database

🔑 **BES internal:** [Tupaia monorepo setup](https://beyond-essential.slab.com/posts/tupaia-monorepo-setup-v5egpdpq) - steps 4 and 5

### Dependencies

We use yarn workspaces to manage our packages, which allows us to run `yarn` once at the project
root, and it will install dependencies everywhere.

## CI/CD

We use codeship for the CI/CD

🔑 **BES internal:** [CI/CD using Codeship](https://beyond-essential.slab.com/posts/ci-cd-using-codeship-uzxspw8z)

## Tests

Most of the packages support the following scripts for testing: 

```

yarn test
yarn test:coverage # also displays code coverage

```

## Style Guide

We use a combination of [ESlint configs](https://eslint.org/docs/user-guide/configuring) to detect quality and formatting issues in code:

- [@beyondessential/eslint-config-js](https://www.npmjs.com/package/@beyondessential/eslint-config-js) for JavaScript packages
- [@beyondessential/eslint-config-ts](https://www.npmjs.com/package/@beyondessential/eslint-config-ts) for TypeScript packages
- [@beyondessential/eslint-config-jest](https://www.npmjs.com/package/@beyondessential/eslint-config-jest) for packages using `Jest`

The config for this repository is defined in `.eslintrc` under the root folder. Additional rules/overrides per package are specified in this file.

⚠️ Please do not use individual eslint configs, but update the main configuration file instead.

### Auto-formatting in Visual Studio Code

In order to automatically format code in VSCode according to our style guide:

1. Install [Prettier for VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2. Enable the `Editor: Format on Save` setting
3. Your files will now be formatted automatically when you save them
