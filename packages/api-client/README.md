## Tupaia Client

Client for connecting to Tupaia APIs

### Usage

```
const auth = new BasicAuthHandler(username, password);
const tupaia = new TupaiaApiClient(auth);
tupaia.entity.getEntity('...')
```