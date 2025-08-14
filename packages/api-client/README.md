# @tupaia/api-client

Client for connecting to Tupaia microservice APIs

### Usage

```
const auth = new BasicAuthHandler(username, password);
const tupaia = new TupaiaApiClient(auth);
tupaia.entity.getEntity('...')
```
