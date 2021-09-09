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

- `jest` Create React App does not include the latest version of `jest-dom` so it needs to be set in jest test scripts https://github.com/testing-library/react-testing-library/issues/141
