# @tupaia/server-boilerplate

Generic boilerplate for back end microservice and orchestration servers.

See:

- [entity-server](../entity-server/README.md) for a typical example of microservice implementation.
- [lesmis-server](../lesmis-server/README.md) for a typical example of orchestrator implementation.

## API creation

Instantiate an API for a server by using either the `MicroServiceApiBuilder` or the `OrchestratorApiBuilder` and providing a TupaiaDatabase connection.

#### Microservice API

- `/v1/test` route is automatically added.
- Basic/Bearer auth can be enabled via the `useBasicBearerAuth` method.

#### Orchestrator API

- `/v1/test`, `/v1/login`, and `/v1/logout` routes are automatically added.
- The session model needs to be specified for the API. This can be done by passing in the desired SessionModel class into the `useSessionModel` method.
- You may wish to provide an optional `verifyLogin` function which consumes a user’s access policy and ensures that have access to the app. This function will be run upon completing a successful login, as well as each time the logged-in user hits an endpoint.

#### Adding routes to the app

- Routes: Add routes to the API via the get/post/etc. methods. When adding the routes to the app, you will need to wrap the routes with the `handleWith` util for the routes to work properly.
  e.g. `new MicroServiceApiBuilder(db, apiName).get('/v1/test', handleWith(TestRoute)).build();`

- Middleware: Add middleware to the API via the use method.
  e.g. `new OrchestratorApiBuilder(db, apiName).use('/v1', attachContext).build();`

## Defining new routes

- Includes `Route` which is base class with useful functionality for handling responses.
- `Route` is a generic class which takes an optional Request and Response type parameters. Use this if your route uses specific parameters, eg:
  e.g. `export class CatRoute extends Route<Request<{ catName: string}>> {}`

## Environment variables

The following environment variables need to be added to the server implementation package.

- For the sessionCookie util, you will need to add the following environment variable:
  - `SESSION_COOKIE_SECRET`
- For the auth connection you will need to add the following API credentials as environment variables:
  - `API_CLIENT_NAME`
  - `API_CLIENT_PASSWORD`
  - `CENTRAL_API_URL`
- You will also need to include any environment variables associated with any additional connections that are added.
  See [.env.example](.env.example)
