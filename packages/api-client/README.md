## Tupaia Client

Client for connecting to Tupaia APIs

Follows [SemVer](https://semver.org/) 

### Install

- `yarn add @tupaia/api-client`

### Usage

```
const auth = new BasicAuthHandler(username, password);
const tupaia = new TupaiaApiClient(auth);
tupaia.entity.getEntity('...')
```

## Publishing

- `yarn publish:run`