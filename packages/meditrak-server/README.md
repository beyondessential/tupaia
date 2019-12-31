# meditrak-server

Backend for the MediTrak health facility survey and mapping software

## Running Locally

- Need to have the following installed
  - Node
  - yarn
- Add a .env file to the root directory, and enter valid environment variables based on LastPass
- `yarn` (to install dependencies)
- `yarn start-dev` to run in dev mode or `yarn start` to build and run production

## Local database

By default, the DB_URL in the .env file will point to the database on the dev server. However, this
can easily become confusing if multiple meditrak-server instances are changing data, so it's nicer
to run a local database.

Meditrak server actually uses exactly the same db as web-config-server, so if you've already set
that up, you don't need to do anything except change the .env DB_URL and DISABLE_SSL variables

If you haven't yet set up the db "tupaia", do the following (and note that you won't need to do this
again if you work on web-config-server):

Set up postgres on your machine and create the database 'tupaia', with credentials matching those in
the .env file.

The project requires importing an initial database dump. This can be obtained from the `#latest-db` channel
on Slack. Import the dump by running:

```bash
psql tupaia -U tupaia < tupaia_dump.sql
```

## Migrations

### Creating a migration

1. Run the command `npm run migrate-create`, you will be prompted to define a name that accurately describes your migration (eg createUserTable ).
2. A file will be created in `src/database/migrations` which is prefixed with the current timestamp and contains your chosen name.
3. Add your migrations to the up method, you can see other migrations in the folder for example or visite the documentation at https://db-migrate.readthedocs.io/en/latest/API/SQL/ to see example migrations.

#### Note

- Think of migrations as create and patch. If you don't get the schema right the first time you can always patch it later with another migration that adds and remove columns or renames things.
- The name you choose in step one won't influence which order your migration is run in relative to other migrations.
- Read the section 'How migrations work' to learn more about what actually happens when migrations are created and then run.

### Running migrations

1. Run `npm run migrate`.
2. To check if a migration finished, visit the PSQL database and look for your migration name at the bottom of the migrations table.

### How migrations work

Migrations using db-migrate work in a similar way to Laravel and Rails. When running migrate, the script will scan the `src/database/migrations` directory and find any files that haven't been added to the `migrations` table of the database. The files will then be executed in alphabetical order and, on each successful migration, a record will be stored in the database to indicate the migration completed and should not be run in the future.

A migration file can be technically called anything however the standard is to prefix it with the current time to guarantee alphabetical order. Migrations function more as patch files than schema definitions. For example if, in a previous migration, a developer created a column that they no longer require they would create a new migration that removes that column and not edit the previous migration to remove the column. A migration is a paper trail of database changes. You wouldn't rewrite commits in GIT in order to fix a bug, similarly you wouldn't rewrite migrations to change schema.

## Tests

### Running the tests

```bash
  yarn test               # Runs all tests
  yarn test -g ${pattern} # Runs tests filtering their file names by ${pattern}
  yarn test-coverage      # Runs tests and displays project test coverage
```

### Filtering describe/it blocks

```js
// Run specific blocks
describe.only('Describe block', function () => {});
it.only(function () => {})

// Skip blocks
describe.skip('One Time Login', function () => {});
it.skip(function () => {} )
```

Remember to **remove** `.only`/`.skip` calls before you commit the test files.

### Test coverage

To display line coverage in code, you can use [Coverage Gutters](https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters) for `Visual Studio Code`

## Code Style

We use [Eslint](https://eslint.org/) to indicate quality and formatting errors in the codebase.

### Code quality

The [Airbnb Style Guide](https://github.com/airbnb/javascript) is used for code quality, other than formatting which is handled by Prettier. Modifications to the default rules are defined in our custom `@beyondessential/eslint-config-beyondessential` package.

### Formatting style

[Prettier](https://prettier.io/) is used for formatting style. `.prettierrc` defines modification to the default rules.
In order to use Prettier in **Visual Studio Code**:

1. Install the `Prettier` plugin
2. Enable the `Editor: Format on Save` setting.
3. You can now format a file either by saving it, or by using the `Format Document` command

### Importing geojson

Documentation for importing geojson can be found [here](src/documentation/importingNewGeojson.md)
