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

### Importing Components
The build splits the ui components into the following 3 bundles.

- map components (based on what's in: `src/components/Map/index.js`)
- chart components (based on what's in:`src/components/Chart/index.js`)
- core ui components (based on what's in: `src/components/index.js`)

#### Core UI Components
eg. `import { Buttton } from @tupaia/ui-components`

#### Map Components
eg `import { Legend } from @tupaia/ui-components/lib/map`

#### Chart Components
eg `import { Chart } from @tupaia/ui-components/lib/chart`