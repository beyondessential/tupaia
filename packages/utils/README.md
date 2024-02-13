# @tupaia/utils

Utility functions that are helpful across multiple packages.

See [src/index.js](src/index.js) for the currently exported functions.

### Requirements

Any consumer is expected to load the following into environment variables:

- `IS_PRODUCTION_ENVIRONMENT`

### Making changes

Handily, [Yarn Workspaces](https://yarnpkg.com/features/workspaces) is able to treat this as a package being pulled from npm, but we never
actually have to publish it. In order to use it in other packages, simply run (for example)

```sh
yarn workspace @tupaia/central-server add @tupaia/utils@1.0.0
```

and then import from [@tupaia/utils](/packages/utils/README.md) as though it were any other dependency.

After making changes to the code in this package, you must run

```sh
yarn workspace @tupaia/utils build
```

(or simply `yarn` at the root level, which builds every internal dependency as a pre-install step) for those changes to be transpiled down and reflected in other packages.
