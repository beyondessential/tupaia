# Tupaia Database

This package provides common database code for use across other packages within this mono-repo.

See https://github.com/beyondessential/tupaia/blob/dev/packages/database/src/index.js for the list of externally available exports

### Making changes

Handily, yarn workspaces is able to treat this as a package being pulled from npm, but we never
actually have to publish it. In order to use it in other packages, simply run (for example)

```
yarn workspace @tupaia/meditrak-server add @tupaia/database@1.0.0
```

and then import from @tupaia/database as though it were any other dependency.

After making changes to the code in this package, you must run

```
yarn workspace @tupaia/database build
```

(or simply `yarn` at the root level, which builds every internal dependency as a preinstall step)
for those changes to be transpiled down and reflected in other packages

## Migrations

### Creating a migration

1. Run the command `yarn run migrate-create`, you will be prompted to define a name that accurately describes your migration (eg createUserTable ).
2. A file will be created in `src/migrations` which is prefixed with the current timestamp and contains your chosen name.
3. For examples, you can look at `src/migrations`, or visit the documentation at https://db-migrate.readthedocs.io/en/latest/API/SQL/.

### Running migrations

1. Run `yarn run migrate`.
2. You can verify that a migration has run by checking the `migrations` table in the database.
3. To debug what's actually run add a `--verbose` flag

#### Note

- Think of migrations as create and patch. If you don't get the schema right the first time you can always patch it later with another migration that adds/removes columns or renames things.

### How migrations work

Migrations using db-migrate work in a similar way to Laravel and Rails. When running migrate, the script will scan the `src/migrations` directory and find any files that haven't been added to the `migrations` table of the database. The files will then be executed in alphabetical order and, on each successful migration, a record will be stored in the database to indicate the migration completed and should not be run in the future.

A migration file can be technically called anything however the standard is to prefix it with the current time to guarantee alphabetical order. Migrations function more as patch files than schema definitions. For example if, in a previous migration, a developer created a column that they no longer require they would create a new migration that removes that column and not edit the previous migration to remove the column. A migration is a paper trail of database changes. You wouldn't rewrite commits in GIT in order to fix a bug, similarly you wouldn't rewrite migrations to change schema.
