# tupaia.org end-to-end tests

[Cypress](https://www.cypress.io/) is used as the end-to-end test framework. This is the root folder of the test code and its configuration.

## Installation

1. If you haven't already, follow the instructions in [Tupaia Monorepo setup](https://docs.beyondessential.com.au/books/software-development/page/tupaia-monorepo-setup) to setup this project.

   ⚠️: In **Step 2. Install node dependencies** you need to run the commands under a Windows terminal, see the note in that section.

2. Point `web-frontend` to a local instance of `web-config-server`. In `packages/web-frontend/.env`, set

   ```bash
   REACT_APP_CONFIG_SERVER_BASE_URL=http://localhost:8000/api/v1/
   ```

3. The tests depend on `.json` configuration files that must be placed under `cypress/config`. To generate the default config:

   ```bash
   # ⊞ Windows users should run this under WSL
   yarn workspace @tupaia/web-frontend cypress:generate-config
   ```

   You can also use custom config by manually populating those files, see the `\*.example.jsonc` files for more information.

## Running the tests

We first need to run the servers locally, then run the end-to-end tests. First, `cd` in the root folder of this project. You can run the tests in either UI or terminal mode.

🍎 MacOS

- UI mode

```bash
yarn workspace @tupaia/web-frontend test:cypress:open
```

- Terminal (headless) mode

```bash
yarn workspace @tupaia/web-frontend test:cypress:run
```

⊞ Windows

Either in a **Windows terminal** or under **WSL**:

```bash
# In one terminal
yarn workspace @tupaia/web-config-server start

# In another terminal
yarn workspace @tupaia/web-frontend start
```

Then, in a **Windows terminal**:

- UI mode

```bash
yarn workspace @tupaia/web-frontend cypress:open
```

- Terminal (headless) mode

```bash
yarn workspace @tupaia/web-frontend cypress:run
```

## Limitations

### Dashboard reports

- Drill down levels are not tested
