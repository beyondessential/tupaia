# @tupaia/psss
Pacific Syndromic Surveillance System project.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start-dev`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

Note: Create React App does not include the latest version of `jest-dom` so it needs to be set in jest test scripts https://github.com/testing-library/react-testing-library/issues/141

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

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
