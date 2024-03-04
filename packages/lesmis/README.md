# @tupaia/lesmis

[Lao PDR Education and Sports Management Information System](https://lesmis.edu.la)

## Available Scripts

In the monorepo root, you can run:

| :------------------------------------ | :--------------------------------------------------------------------------- |
| `yarn start-stack lesmis   `            | Run the app and the backend servers in development mode                     |
| `yarn workspace @tupaia/lesmis start`                          | Run the app in development mode                                             |
| `yarn workspace @tupaia/lesmis test`  | Launch [Jest](https://jestjs.io) test runner in the interactive watch mode |
| `yarn workspace @tupaia/lesmis build` | Build the app for production to the `build/` folder                         |

## High-level overview

#### Routing

The **lesmis** frontend talks to two APIs:

- [**lesmis-server**](../lesmis-server/README.md) for LESMIS-specific routes needed to run the LESMIS custom frontend.
- [**admin-panel-server**](../admin-panel-server/README.md) for running the LESMIS Admin Panel, including everything from auth, CRUD and all special routes e.g. [Viz Builder](../admin-panel/README.md#viz-builder-app).
	- Some routes like the CRUD routes are forwarded on to [central-server](../central-server/README.md).

## Coding conventions

#### Views

A view is a component that connects to a route (i.e. react-router Route).

## Environment variables

You need to set your environment variables in the .env file for the app to work. Go to the [.env.example](.env.example) file to see a list of the required variables.

## URL pattern

```
lesmis.org/:language/:organisationUnitCode:/:view
```

Query params: `year`, `reportId`, etc.

Example URL: `lesmis.org/en/LA_Xaythany/map/?year=2020&reportId=1235`

User URLS:

- `lesmis.org/en/login`
- `lesmis.org/en/profile`