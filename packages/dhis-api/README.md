## @tupaia/dhis-api

This package contains an abstraction layer over the DHIS2 api

See https://github.com/beyondessential/tupaia/blob/dev/packages/dhis-api/src/index.js for the list of externally available exports

### Requirements

Any consumer is expected to load the following into environment variables:

- DHIS_CLIENT_ID
- DHIS_CLIENT_SECRET
- DHIS_PASSWORD
- DHIS_USERNAME
- IS_PRODUCTION_ENVIRONMENT

### Making changes

Handily, yarn workspaces is able to treat this as a package being pulled from npm, but we never
actually have to publish it. In order to use it in other packages, simply run (for example)

```
yarn workspace @tupaia/central-server add @tupaia/dhis-api@1.0.0
```

and then import from @tupaia/dhis-api as though it were any other dependency.

After making changes to the code in this package, you must run

```
yarn workspace @tupaia/dhis-api build
```

(or simply `yarn` at the root level, which builds every internal dependency as a preinstall step)
for those changes to be transpiled down and reflected in other packages
