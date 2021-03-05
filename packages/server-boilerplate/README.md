# @tupaia/server-boilerplate

Generic boilerplate for back end orchestration servers.

See lesmis-server for a typical example of implementation.

## App bootstrapping

#### Attaching the session model
- The session model needs to be added to the app. This can be done using the `sessionModel` model and `attachSessionModel` util which are found in this package.
eg. `app.use(attachSessionModel(sessionModel));`
 
#### addRoutesToApp
- When adding the routes to the app, you will need to wrap the routes with the the `handleRoute` util for the routes to work properly.
eg. `app.get('/v1/test', handleWith(TestRoute));`

- You also need to add the error hanlder as the fallback route.
eg. `app.use(handleError);`

## Routes
- Includes Route which is base class with useful functionality for handling responses. Route is an abstract class which must be extended to custom routes.
- Includes some commonly used routes for handling logging in and logging out etc.

## Environment variables
The following environment variables need to be added to the server implementaion package.

- For the sessionCookie util, you will need to add the following environment variable:
    - `SESSION_COOKIE_SECRET`
- For the auth connection you will need to add the following meditrak api credentials as environment variables:
    - `MEDITRAK_API_CLIENT_NAME`
    - `MEDITRAK_API_CLIENT_PASSWORD`
    - `MEDITRAK_API_URL`
- You will also need to include any environment variables associated with any additional connections that are added. 