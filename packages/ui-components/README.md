# @tupaia/ui-components

A library of user interface components for the Tupaia project.

## Available scripts

In the package directory, you can run:

```sh
yarn storybook
```

Or from the monorepo root:

```sh
yarn workspace @tupaia/ui-components storybook
```

This runs the Storybook app and pulls stories from the [`stories/`](stories/) directory which have a `.stories.js` suffix.

The page will reload if you make edits.

## Storybook

[Storybook](https://storybook.js.org) is an open-source tool for developing UI components.

## Material UI

The components are mostly built on top of components from the [Material UI (version 4)](https://v4.mui.com) library.

## Notes on approach

- Use [Styled Components](https://styled-components.com) to customise components.
- Import Material UI components with a `Mui` prefix to when you need to disambiguate them from custom components. e.g. `import { Button as MuiButton } from '@material-ui/core'`
- Avoid hard-coding children and allow them to be passed in as JSX as much as possible.
- Export components using named exports.
