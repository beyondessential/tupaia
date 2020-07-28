# @tupaia/psss
Pacific Syndromic Surveillance System project.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

- `yarn start` Runs the app in the development mode
- `yarn start-server` Starts meditrak-server
- `yarn start-dev` Runs start and start-server
- `yarn test` Launches the test runner in the interactive watch mode.
- `yarn test:cypress:open` Launches cypress in interactive watch mode.
- `yarn test:cypress:run` Runs cypress tests.
- `yarn build` Builds the app for production to the `build` folder.

#### Testing notes
- `Cypress` Add a `cypress.env.json` file with real example `username` and `userPassword` values  
- `jest` Create React App does not include the latest version of `jest-dom` so it needs to be set in jest test scripts https://github.com/testing-library/react-testing-library/issues/141

## Code Style

We use [Eslint](https://eslint.org/) to indicate quality and formatting errors in the codebase.

### Code quality

The [Airbnb Style Guide](https://github.com/airbnb/javascript) is used for code quality, other than formatting which is handled by Prettier. Modifications to the default rules are defined in our custom `@beyondessential/eslint-config-beyondessential` package.

### Formatting style

[Prettier](https://prettier.io/) is used for formatting style. `.prettierrc` defines modification to the default rules.
In order to use Prettier in **Visual Studio Code**:

1. Install the `Prettier` plugin
2. Enable the `Editor: Format on Save` setting.
3. You can now format a file simply by saving it
