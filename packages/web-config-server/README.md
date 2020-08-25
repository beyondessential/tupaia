# Tupaia Config Server

## Open Source Info

### Open Source Mission statement

> By engaging and collaborating with our community we can deliver a more robust product that bridges cultural differences and empowers decision making within health systems worldwide.

### Code of Conduct

For contributor's code of conduct - see the [code-of-conduct.md](https://gitlab.com/beyond-essential/tupaia/blob/master/code-of-conduct.md) published in the repo.

## Initial setup

First, install project dependencies by running `yarn install`.

Add a .env file to the root directory. The required variables are listed in `.env.example`.

Set up postgres on your machine and create the database 'tupaia', with credentials matching those in
the .env file.

The project requires importing an initial database dump. Grab the latest database dump from dev server using `yarn dump-database ~/path/to/key.pem` (pem key can be obtained in LastPass - Tupaia Main Server). This will create a db dump and pull it to your current directory. You also need to be added into the Security Groups of the server.

After pulling the latest database dump from dev server, run:

```bash
yarn refresh-database tupaia_dump.sql
```

or on windows, first DROP and recreate the tupaia database, then run:

```bash
psql -U tupaia < tupaia_dump.sql
```

## Development

Run `yarn start-dev` to start running on local machine.

If you want to connect to a local aggregation server/DHIS2 instance, clone the repo /sussol/docker-dhis2

### [DHIS2 Docker](https://github.com/sussol/docker-dhis2)

- read documentation for dhis2 docker @ repo's md
- `./dhis-start.sh` start docker dhis

## Directory Structure and Explanation

### ./src

##### index.js

Entry point for the app, using `express js`. Initialises server and sets middlewares use:

- `morgan('dev')` -> simple console logger
- `bodyParser` -> auto parse request body as json
- `checkBadJson` -> adequately deal with incorrect json requests (this should be tied in with error handler, and be logged via email)
- After that, initialise database and continue ->
- `authInit` -> sets up cookie sessions
- `auth` -> check each request for appropriate authorisation
- `/api/v1, api_v1` -> links router defined in `apiV1` to `/api/v1`
- then start server and log port

### ./src/apiV1

##### index.js

Router is defined here, to introduce new route under `/api/v1`:

`app.<get/post>('/routepath', routeFunct())` where `routeFunct` is in the format:

```
export default () => (req,res,next) => {
      // do something with req.body (as json)
      // send response via res.send(response json)
}
```

### ./src/authSession

Authentication functions

- `authInit` -> first middleware for request, from 'client-sessions', deals with decrypting session and setting sessions further down the line

### ./src/appServer

API connect for Tupaia App server

- `auth` -> second middleware for request, checks to see if session (cookie) exists
- `authLogin` -> checks users password / username matches db
- `authCreateUser` -> creates a new user using a set of fields
- `authChangePassword` -> changes the password of an existing user
- `authGetCountryAccessList` -> gets the user's access to the available countries
- `authRequestCountryAccess` -> requests user access to specified countries

### ./src/dhis

Deals with oauth2 authentication and request from dhis2

## Exporting charts and Lambda

In order to export charts from a local instance of the config server you'll need to
get an AWS API access key set up for your user account. Then, in `startConfigServer.sh` you'll need to add the following lines:

```
AWS_ACCESS_KEY_ID='[YOUR KEY ID]' \
AWS_SECRET_ACCESS_KEY='[YOUR ACCESS KEY]' \
```

In order for our Lambda method to export a chart it needs to have access to the front-end it's exporting from. You can't do this locally however you can add the following lines to `startConfigServer.sh` to export charts from the dev server:

```
EXPORT_URL=https://dev-config.tupaia.org \
EXPORT_COOKIE_URL=dev-config.tupaia.org \
```

Note: The `EXPORT_COOKIE_URL` should not contain a http or https prefix.

There's one exception however, authentication cookies will not work so you'll only be able to export publicly accessible charts (though you'll still need to log in in order for the config server to know which email address to send the export to).

## Code Style

We use [Eslint](https://eslint.org/) to indicate quality and formatting errors in the codebase.

### Code quality

The [Airbnb Style Guide](https://github.com/airbnb/javascript) is used for code quality, other than formatting which is handled by Prettier. Modifications to the default rules are defined in our custom `@beyondessential/eslint-config-beyondessential` package.

### Formatting style

[Prettier](https://prettier.io/) is used for formatting style. `.prettierrc` defines modification to the default rules. \
\
In order to use Prettier in **Visual Studio Code**:

1. Install the `Prettier` plugin
2. Enable the `Editor: Format on Save` setting.
3. You can now format a file either by saving it, or by using the `Format Document` command

## Debugging

### Visual Studio Code

1. Start the server: `yarn start-dev`
2. Open the **Debug** tab and select `nodemon` from the available configurations
3. Click the green arrow to `Start Debugging`. A list with currently running Node processes will pop up. Select the one that starts with `--inspect=9999`
4. You are ready to start debugging! Add breakpoints to your code to inspect the program state. You can also enable breakpoints at `All Exceptions` to effectively
   debug errors.

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
