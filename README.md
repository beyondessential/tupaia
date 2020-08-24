# Tupaia

> This is a [mono-repo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)

It is set up using `yarn workspaces`, meaning any command you would normally run inside a package can
be run from the root directory using `yarn workspace @tupaia/package-name command`, e.g.
`yarn workspace @tupaia/meditrak-server start-dev`

## Packages

The easiest way to open the packages in vscode is to double click 'tupaia-packages.code-workspace'.
This opens all packages as roots in the workspace, and means linting etc. will work correctly.

### Main packages

- [admin-panel](https://github.com/beyondessential/tupaia/blob/dev/packages/admin-panel/README.md)
- [meditrak-app](https://github.com/beyondessential/tupaia/blob/dev/packages/meditrak-app/README.md)
- [meditrak-server](https://github.com/beyondessential/tupaia/blob/dev/packages/meditrak-server/README.md)
- [psss](https://github.com/beyondessential/tupaia/blob/dev/packages/psss/README.md)
- [web-config-server](https://github.com/beyondessential/tupaia/blob/dev/packages/web-config-server/README.md)
- [web-frontend](https://github.com/beyondessential/tupaia/blob/dev/packages/web-frontend/README.md)

Any of the main packages can be run using `yarn workspace @tupaia/package-name start-dev`.
In the case of the two servers, this will also build and watch all of the internal dependencies, so
that hot reload detects changes to other packages within the mono-repo. As this delays startup time,
if you prefer to prebuild internal dependencies, add `--skip-internal` to the above command.

### Internal dependencies

- [access-policy](https://github.com/beyondessential/tupaia/blob/dev/packages/access-policy/README.md)
- [aggregator](https://github.com/beyondessential/tupaia/blob/dev/packages/aggregator/README.md)
- [auth](https://github.com/beyondessential/tupaia/blob/dev/packages/auth/README.md)
- [database](https://github.com/beyondessential/tupaia/blob/dev/packages/database/README.md)
- [data-broker](https://github.com/beyondessential/tupaia/blob/dev/packages/data-broker/README.md)
- [devops](https://github.com/beyondessential/tupaia/blob/dev/packages/devops/README.md)
- [dhis-api](https://github.com/beyondessential/tupaia/blob/dev/packages/dhis-api/README.md)
- [ui-components](https://github.com/beyondessential/tupaia/blob/dev/packages/ui-components/README.md)
- [utils](https://github.com/beyondessential/tupaia/blob/dev/packages/utils/README.md)

## Getting started

### Secrets

Most packages will require a .env file, which can usually be found in lastpass. Use the LOCAL entry
if one exists for the package, otherwise use the DEV entry.

### Dependencies

We use yarn workspaces to manage our packages, which allows us to run `yarn` once at the project
root, and it will install dependencies everywhere.

## CI/CD

We use codeship for the admin-panel, meditrak-server, web-config-server, and web-frontend packages.

For codeship to use our environment variables, we store them encrypted and committed to the repo as
ci-env-vars.encrypted inside each package. In order to update an environment variable:

- modify your local .env file
- download the codeship encryption key (either from LastPass or codeship itself) and save as codeship.aes in the root directory
- run `yarn update-codeship-env-vars`

Note that environment variables are also stored in AWS parameter store for new dev and feature deployments to pull from,
so if you've updated the environment variables here, you probably also need to persist them across there

- ssh into the aws instance (cannot be run locally at this stage)
- update the .env file (if it hasn't been updated automatically by the CI/CD process)
- run `ENVIRONMENT=dev yarn update-paramater-store-env-vars` (setting environment to either dev or production)

## Tests

Most of the packages support the following scripts for testing:

```
yarn test # runs the tests
yarn test-coverage # runs the tests and displays code coverage
```
