## tupaia.org end-to-end tests

[Cypress](https://www.cypress.io/) is used as the end-to-end test framework. The tests and related code are located under this folder.

### Installation

- Add a `cypress.env.json` file under the root folder of `web-frontend` (see [cypress.env.example.json](https://github.com/beyondessential/tupaia/tree/dev/packages/web-frontend/cypress.env.example.json) for a template)
- You must also have `web-config-server` correctly set up.

### Running the tests

To get the back-end, front-end and end-to-end tests running, use one of the following commands:

```bash
# UI mode
yarn test:cypress:open

# Terminal (headless) mode
yarn test:cypress:run
```
