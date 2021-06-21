# E2e Tests

[Cypress](https://www.cypress.io/) is used as the end-to-end test framework. This is the root folder of the test code and its configuration.

## Installation

1. If you haven't already, follow the instructions in [Tupaia Monorepo setup](https://docs.beyondessential.com.au/books/software-development/page/tupaia-monorepo-setup) to setup this project.

   ⚠️: In **Step 2. Install node dependencies** you need to run the commands under a Windows terminal, see the note in that section.

2. Make sure that you have a valid `.env` file under `packages/web-frontend` - see [.env.example](../.env.example) for the required variables. Then, add/update the following:

   ```bash
   CYPRESS_BASE_URL=http://localhost:8088
   REACT_APP_CONFIG_SERVER_BASE_URL=http://localhost:8000/api/v1/
   ```

3. The tests depend on `.json` configuration files that must be placed under `cypress/config`. To generate the default config:

   ```bash
   yarn workspace @tupaia/web-frontend cypress:config
   ```

   You can also use custom config by manually populating those files. See the [config docs](config/README.md) for more details

4. Finally, we need to install some [Cypress dependencies](https://docs.cypress.io/guides/getting-started/installing-cypress#Linux) - see that link

## Running the tests locally

First, we need to start tupaia.org locally:

```bash
# In one terminal
yarn workspace @tupaia/web-config-server start
# In another terminal
yarn workspace @tupaia/web-frontend start
```

Then, run one of the following commands in a new terminal:

- UI mode: `yarn workspace @tupaia/web-frontend cypress:open`
- Terminal mode: `yarn workspace @tupaia/web-frontend cypress:run`

## Configuration

Our e2e tests support Tupaia-specific configuration specified in [config.json](config.json). Example:

```jsonc
{
  "dashboardReports": {
    "allowEmptyResponse": false, // Throw error for empty reports
    "snapshotTypes": ["responseBody", "html"],
    "urlFiles": ["cypress/config/dashboardReportUrls/default.json"],
    "urls": ["/explore/explore/IHR%20Report?report=WHO_IHR_SPAR_WPRO"],
    "filter": {
      // Single values can also be used instead of arrays, eg `"project": "covidau"`
      "id": ["id1", "id2"],
      "project": ["covidau", "strive"],
      "orgUnit": ["TO", "PG"],
      "dashboardGroup": ["dashboardGroup1", "dashboardGroup2"],
      "dataBuilder": ["tableOfEvents", "sumAll"]
    }
  },
  "mapOverlays": {
    "allowEmptyResponse": false,
    "snapshotTypes": ["responseBody"],
    "urlGenerationOptions": {
      "project": ["strive", "covidau"]
    },
    "urls": ["/covidau/AU?overlay=AU_FLUTRACKING_Fever_And_Cough"],
    "filter": {
      "id": "id",
      "project": "covidau",
      "orgUnit": "TO",
      "measureBuilder": "valueForOrgGroup"
    }
  }
}
```

### Dashboard report & map overlay configuration

**Snapshot types**

| Type           | Description                                                                                         | Reports | Overlays |
| -------------- | --------------------------------------------------------------------------------------------------- | ------- | -------- |
| `responseBody` | The body of the request which provides the data for the item under test                             | ✔       | ✔        |
| `html`         | A snapshot of the DOM, sanitised to remove non-deterministic content (eg dynamically generated ids) | ✔       | ❌       |

**Urls**

Some of our tests use urls to adjust the scope of the testable items.

Two formats are supported:

- String:

  `/covidau/AU/COVID-19?report=COVID_Compose_Daily_Deaths_Vs_Cases`

- Object:

  ```json
  {
    "id": "COVID_Compose_Daily_Deaths_Vs_Cases",
    "project": "covidau",
    "orgUnit": "AU",
    "dashboardGroup": "COVID-19"
  }
  ```

Use any of the fields below to specify test urls. You can use multiple fields in the same test run - their results will be combined in the final url list:

```jsonc
{
  // Inline urls
  "urls": ["/covidau/AU/COVID-19?report=COVID_Compose_Daily_Deaths_Vs_Cases"],

  // Load urls from files
  "urlFiles": [
    "cypress/config/dashboardReportUrls/default.json",
    "cypress/config/dashboardReportUrls/covidau.json"
  ],

  // Dynamically generate urls
  "urlGenerationOptions": {
    "project": ["strive", "covidau"]
  }
}
```

**Filter**

You can optionally specify a `filter` that will be applied to the tested visualisations. For example, to test all "Fanafana" project overlays that use the "valueForOrgGroup" data builder in Tonga:

```json
{
  "mapOverlays": {
    "urlGenerationOptions": {
      "project": "fanafana"
    },
    "filter": {
      "orgUnit": "TO",
      "measureBuilder": "valueForOrgGroup"
    }
  }
}
```

## Limitations

### Dashboard reports

- Drill down levels are not tested
