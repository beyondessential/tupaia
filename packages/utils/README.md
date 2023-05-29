## @tupaia/utils

Utility functions that are helpful across multiple packages

See [here](https://github.com/beyondessential/tupaia/blob/dev/packages/utils/src/index.js) for the currently exported functions

### Requirements

Any consumer is expected to load the following into environment variables:

- IS_PRODUCTION_ENVIRONMENT

### Making changes

Handily, yarn workspaces is able to treat this as a package being pulled from npm, but we never
actually have to publish it. In order to use it in other packages, simply run (for example)

```
yarn workspace @tupaia/central-server add @tupaia/utils@1.0.0
```

and then import from @tupaia/utils as though it were any other dependency.

After making changes to the code in this package, you must run

```
yarn workspace @tupaia/utils build
```

(or simply `yarn` at the root level, which builds every internal dependency as a preinstall step)
for those changes to be transpiled down and reflected in other packages
