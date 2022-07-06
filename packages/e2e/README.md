# E2e Tests

[Cypress](https://www.cypress.io/) is used as the end-to-end test framework. This is the root folder of the test code and its configuration.

## Running the tests locally

See https://beyond-essential.slab.com/posts/e-2-e-test-guide-cnj4rgdb#running-the-tests

## Configuration

Our e2e tests support Tupaia-specific configuration specified in [config.json](config.json). Example:

```jsonc
{
  "baselineUrl": "https://e2e.tupaia.org",
  "compareUrl": "https://compare-e2e.tupaia.org",
  "dashboardReports": {
    "allowEmptyResponse": false, // Throw error for empty reports
    "snapshotTypes": ["responseData", "html"],
    "urlFiles": ["cypress/config/dashboardReportUrls/default.json"],
    "urls": ["/explore/explore/IHR%20Report?report=WHO_IHR_SPAR_WPRO"],
    "filter": {
      "code": ["report_code1", "report_code2"],
      "project": ["covidau", "strive"],
      "orgUnit": "PG",
      "dashboard": "Dashboard1",
      "dataBuilder": ["tableOfEvents", "sumAll"]
    }
  },
  "mapOverlays": {
    "allowEmptyResponse": false,
    "snapshotTypes": ["responseData"],
    "urlGenerationOptions": {
      "id": "overlay_id",
      "orgUnit": ["TO", "VU"],
      "project": "unfpa"
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

You can find more information about config fields in the section below. For the exact schema, check [configSchema.js](scripts/generateConfig/configSchema.js#L22).

### Dashboard report & map overlay configuration

#### Snapshot types

| Type           | Description                                                                                         | Reports | Overlays |
| -------------- | --------------------------------------------------------------------------------------------------- | ------- | -------- |
| `responseData` | The body of the request which provides the data for the item under test                             | ✔       | ✔        |
| `html`         | A snapshot of the DOM, sanitised to remove non-deterministic content (eg dynamically generated ids) | ✔       | ❌       |

#### Urls

Some of our tests use urls to adjust the scope of the testable items.

Two formats are supported:

- String:

  ```
  # Dashboard report
  /covidau/AU/COVID-19?report=COVID_Compose_Daily_Deaths_Vs_Cases&reportPeriod=1st_Jan_2020-31st_Dec_2020

  # Map overlay
  /covidau/AU/COVID-19?overlay=AU_FLUTRACKING_Participants_Per_100k
  ```

- Object:

  ```jsonc
  // dashboard report
  {
    "code": "COVID_Compose_Daily_Deaths_Vs_Cases",
    "project": "covidau",
    "orgUnit": "AU",
    "dashboard": "COVID-19",
    "startDate": "2020-01-01",
    "endDate": "2020-12-31"
  }

  // map overlay
  {
    "id": "PSSS_FJ_AFR_Syndrome_Bubble_Radius_Weekly",
    "project": "psss",
    "orgUnit": "FJ",
    "startDate": "2021-02-01",
    "endDate": "2021-02-07"
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

  // ⚠️ This field is not currently available in CI/CD test runs
  //
  // Dynamically generate urls (available for `mapOverlays`)
  // If the same overlay id is selected for the same country across projects, only the first
  // project will be used, since the overlay will be the same in all these cases
  "urlGenerationOptions": {
    "project": ["strive", "covidau"]
  }
}
```

#### Filter

⚠️ This field is **not** currently available in CI/CD test runs

You can optionally specify a `filter` that will be applied to the tested visualisations. For example, to test all "Fanafana" project overlays that use the "valueForOrgGroup" data builder in Tonga and Vanuatu:

```json
{
  "mapOverlays": {
    "urlGenerationOptions": {
      "project": "fanafana"
    },
    "filter": {
      "orgUnit": ["TO", "VU"],
      "measureBuilder": "valueForOrgGroup"
    }
  }
}
```

## Limitations

- **Dashboard reports:** drill down levels are not tested
- **Map overlays:** only the response data are tested, the UI components are not tested
