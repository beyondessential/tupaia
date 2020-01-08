# Tupaia

> This is a [mono-repo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)

## Packages

- [common](https://github.com/beyondessential/tupaia/blob/dev/packages/common/README.md) - shared utilities
- [access-policy](https://github.com/beyondessential/tupaia/blob/dev/packages/access-policy/README.md)
- [admin-panel](https://github.com/beyondessential/tupaia/blob/dev/packages/admin-panel/README.md)
- [devops](https://github.com/beyondessential/tupaia/blob/dev/packages/devops/README.md)
- [meditrak-app](https://github.com/beyondessential/tupaia/blob/dev/packages/meditrak-app/README.md)
- [meditrak-server](https://github.com/beyondessential/tupaia/blob/dev/packages/meditrak-server/README.md)
- [web-config-server](https://github.com/beyondessential/tupaia/blob/dev/packages/web-config-server/README.md)
- [web-frontend](https://github.com/beyondessential/tupaia/blob/dev/packages/web-frontend/README.md)

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
