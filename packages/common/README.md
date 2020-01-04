## Tupaia Common

This package provides common utilities for use across other packages within this mono-repo.

Handily, yarn workspaces is able to treat this as a package being pulled from npm, but we never
actually have to publish it. In order to use it in other packages, simply run (for example)

```
yarn workspace @tupaia/meditrak-server add @tupaia/common@0.1.0
```

and then import from @tupaia/common as though it were any other dependency.

After making changes to the code in this package, you must run

```
yarn workspace @tupaia/common build
```

for those changes to be transpiled down and reflected in other packages
