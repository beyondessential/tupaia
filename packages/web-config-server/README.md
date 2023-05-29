# Tupaia Config Server

## Open Source Info

### Open Source Mission statement

> By engaging and collaborating with our community we can deliver a more robust product that bridges cultural differences and empowers decision making within health systems worldwide.

### Code of Conduct

For contributor's code of conduct - see the [code-of-conduct.md](https://gitlab.com/beyond-essential/tupaia/blob/master/code-of-conduct.md) published in the repo.

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

## Debugging

### Visual Studio Code

1. Start the server: `yarn start-dev`
2. Open the **Debug** tab and select `nodemon` from the available configurations
3. Click the green arrow to `Start Debugging`. A list with currently running Node processes will pop up. Select the one that starts with `--inspect=9999`
4. You are ready to start debugging! Add breakpoints to your code to inspect the program state. You can also enable breakpoints at `All Exceptions` to effectively
   debug errors.
