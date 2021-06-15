# e2e Test Configuration

The e2e tests in this package are configurable. You can adjust the testing scope by updating the config files in this folder. There are two ways to do so:

1. Populate their contents manually
2. Run `yarn workspace @tupaia/web-frontend cypress:config` for dynamic content generation

| File                                                 | Description                        | Can be generated? |
| ---------------------------------------------------- | ---------------------------------- | ----------------- |
| [dashboardReportUrls.json](dashboardReportUrls.json) | A list of report urls to be tested | ✔                 |
