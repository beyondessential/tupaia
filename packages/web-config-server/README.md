# @tupaia/web-config-server

Orchestration server for the main Tupaia application

## Development

To run locally, run from the monorepo root:

```sh
yarn start-stack tupaia-web
```

If you want to connect to a local aggregation server/DHIS2 instance, clone the [docker-dhis2](https://github.com/beyondessential/docker-dhis2) repository.

### [DHIS2 Docker](https://github.com/sussol/docker-dhis2)

- Read DHIS2 Docker’s [README](https://github.com/beyondessential/docker-dhis2#readme).
- `./dhis-start.sh` to start Docker DHIS.

## Directory structure and explanation

### [./src](src)

#### [index.js](src/index.js)

Entry point for the app, using [Express](https://expressjs.com). Initialises server and sets middlewares’ use:

- `morgan('dev')` → simple console logger
- `bodyParser` → auto parse request body as JSON
- `checkBadJson` → adequately deal with incorrect JSON requests (this should be tied in with error handler, and be logged via email)
- After that, initialise database and continue →
- `authInit` → sets up cookie sessions
- `auth` → check each request for appropriate authorisation
- `/api/v1, api_v1` → links router defined in `apiV1` to `/api/v1`
- then start server and log port

### [./src/apiV1](src/apiV1)

#### [index.js](src/apiV1/index.js)

Router is defined here, to introduce new route under `/api/v1`:

`app.<get/post>('/routepath', routeFn())` where `routeFn` is in the format:

```js
export default () => (req, res, next) => {
  // Do something with req.body (as JSON)
  // Send response via res.send(response JSON)
};
```

### [./src/authSession](src/authSession)

Authentication functions.

| :--------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `authInit` | first middleware for request, from 'client-sessions', deals with decrypting session and setting sessions further down the line |

### [./src/appServer](appServer)

API connect for Tupaia App server.

| :------------------------- | :---------------------------------------------------------------------- |
| `auth`                     | Second middleware for request, checks to see if session (cookie) exists |
| `authLogin`                | Checks user’s password, username matches DB                             |
| `authCreateUser`           | Creates a new user using a set of fields                                |
| `authChangePassword`       | Changes the password of an existing user                                |
| `authGetCountryAccessList` | Gets the user’s access to the available countries                       |
| `authRequestCountryAccess` | Requests user access to specified countries                             |

### [./src/dhis](src/dhis)

Deals with OAuth 2 authentication and request from DHIS2.

## Debugging

### Visual Studio Code

1. Start the server: `yarn start-dev`.
2. Open the **Debug** tab and select `nodemon` from the available configurations.
3. Click the green arrow to `Start Debugging`. A list with currently running Node processes will pop up. Select the one that starts with `--inspect=9999`
4. You are ready to start debugging! Add breakpoints to your code to inspect the program state. You can also enable breakpoints at `All Exceptions` to effectively debug errors.
