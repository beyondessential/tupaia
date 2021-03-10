# web-frontend e2e tests

[Cypress](https://www.cypress.io/) is used as the end-to-end test framework. This is the root folder of the test code and its configuration.

## Installation

1. If you haven't already, follow the instructions in [Tupaia Monorepo setup](https://docs.beyondessential.com.au/books/software-development/page/tupaia-monorepo-setup) to setup this project.

   ⚠️: In **Step 2. Install node dependencies** you need to run the commands under a Windows terminal, see the note in that section.

2. Make sure that you have a valid `.env` file under `packages/web-frontend` - see [.env.example](../.env.example) for the required variables.

   > If you want to point to a local backend, set the following in `.env`:
   >
   > ```bash
   > REACT_APP_CONFIG_SERVER_BASE_URL=http://localhost:8000/api/v1/
   > ```

3. The tests depend on `.json` configuration files that must be placed under `cypress/config`. To generate the default config:

   ```bash
   yarn workspace @tupaia/web-frontend cypress:generate-config
   ```

   You can also use custom config by manually populating those files.

## Running the tests locally

We first need to start the servers locally, then run the e2e tests. The following scripts take care of both tasks:

```bash
# We can run the tests in either UI or terminal mode

# UI Mode
yarn workspace @tupaia/web-frontend test:cypress:open

# Terminal (headless) mode
yarn workspace @tupaia/web-frontend test:cypress:run
```

## Limitations

### Dashboard reports

- Drill down levels are not tested
