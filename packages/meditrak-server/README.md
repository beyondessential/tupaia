# meditrak-server

Backend for the MediTrak health facility survey and mapping software

## Running Locally

- Need to have the following installed
  - Node
  - yarn
- Add a .env file to the root directory. The required variables are listed in `.env.example`
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
