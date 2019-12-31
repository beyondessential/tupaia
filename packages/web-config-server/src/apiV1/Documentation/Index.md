# Config-Server API V1

And api for handling Front End -> Config-Server interactions. Front end being a web browser and Config-Server is a node.js server based on expressJS. Documentation is intended for internal uses only.

#### Root URL

(config server ip or url)`/api/v1`

#### Flow

- Authenticate as per `./login.md`, on `success` a session (cookie) will be established and further api calls can be made, cookie encrypts and stores user information, so in further api calls no need to specify user, also authenticated=true response will be sent (as per Common Responses below). On `fail` a common unauthorised response will be sent (as per Common Responses below)
- A session cookies will last `(x)` amount of seconds, as per .env, upon request will refresh for extra `(y)` seconds.
- API request should be made after successful authentication
- Logout as per `./logout.md`

#### Common Responses

- ##### authentication failed / unauthorised

  status: `401`
  text: `unauthorised`
  when failed to login will show unauthorised (even though will have session cookie for public user)

- ##### server error
  status: `500`
  text: `Internal server error`
- ##### authenticated
  status: `200` json: `{authenticated: true, defaultOrganisatioUnit: orgUnitId}` on successful login, see `./login.md`
- ##### logged out
  status `200` json: `{loggedout: true}` on log out, see `./logout.md`
