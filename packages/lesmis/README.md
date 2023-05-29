# @tupaia/lesmis

Lao PDR Education and Sports Management Information System.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

- `yarn start` Runs the app in development mode.
- `yarn start-fullstack` Runs the app and the backend servers in development mode.
- `yarn test` Launches jest test runner in the interactive watch mode.
- `yarn build` Builds the app for production to the `build` folder.

## High level overview

#### Routing

The lesmis frontend talks to two APIs:
- **lesmis-server** for lesmis specific routes needed to run the LESMIS custom frontend.
- **admin-panel-server** for running the LESMIS Admin Panel, including everything from auth, CRUD and all special routes e.g. viz builder.
  - Some routes like the CRUD routes are forwarded on to central-server.

## Coding Conventions

#### Views
A view is a component that connects to a route (ie. react-router Route).

## Environment Variables
- You need to set your environment variables in the .env file for the app to work. Go to the .env.examples file to see a list of the required varialbes.


## URL Pattern
lesmis.org/:language/:organisationUnitCode:/:view

query params
year
reportId
etc

example url:
lesmis.org/en/LA_Xaythany/map/?year=2020&reportId=1235

user urls
lesmis.org/en/login
lesmis.org/en/profile
