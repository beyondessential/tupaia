# @tupaia/ui-components
A library of user interface components for the Tupaia project.

## Available Scripts
In the project directory, you can run:

`yarn storybook`

Runs the storybook app and pulls stories from the `src` directory which have a .stories.js suffix.<br />

The page will reload if you make edits.<br />

## Story Book

Storybook is an open source tool for developing UI components.
[https://github.com/storybookjs/storybook](https://github.com/storybookjs/storybook)

## Material UI

The components are mostly built on top of components from the Material UI library. https://material-ui.com.

##### Notes on approach:

 - Use [styled components](https://styled-components.com) to customise components
 - Import Material UI components with a Mui prefix to distinguish them from custom components. eg. `import MuiButton from '@material-ui/core/Button';`

 - Avoid hard coding children and allow them to be passed in as JSX as much as possible
 - Export components using named exports
 
## Code Style

We use [Eslint](https://eslint.org/) to indicate quality and formatting errors in the codebase.

### Code quality

The [Airbnb Style Guide](https://github.com/airbnb/javascript) is used for code quality, other than formatting which is handled by Prettier. Modifications to the default rules are defined in our custom `@beyondessential/eslint-config-beyondessential` package.

### Formatting style

[Prettier](https://prettier.io/) is used for formatting style. `.prettierrc` defines modification to the default rules.
In order to use Prettier in **Visual Studio Code**:

1. Install the `Prettier` plugin
2. Enable the `Editor: Format on Save` setting.
3. You can now format a file either by saving it, or by using the `Format Document` command 