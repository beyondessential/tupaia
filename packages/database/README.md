## Tupaia Database

This package provides common database code for use across other packages within this mono-repo.

Handily, yarn workspaces is able to treat this as a package being pulled from npm, but we never
actually have to publish it. In order to use it in other packages, simply run (for example)

```
yarn workspace @tupaia/meditrak-server add @tupaia/database@0.1.0
```

and then import from @tupaia/database as though it were any other dependency.

After making changes to the code in this package, you must run

```
yarn workspace @tupaia/database build
```

for those changes to be transpiled down and reflected in other packages
