# @tupaia/admin-panel

Frontend interface for the [Admin Panel](https://admin.tupaia.org) web app.

## User Guide

Most aspects are fairly self explanatory, but this guide should cover any tricky bits as they get added.

### Importing GeoJSON

Documentation for importing GeoJSON can be found [here](doc/importingNewGeojson.md).

### Creating an API Client

When creating a new user, you have the option to create them as an API client. When you do this, you have one chance only to retrieve the client secret. The steps for Google Chrome are:

1. Open the inspector (right click → “Inspect”).
2. Select the “Network” tab.
3. On the Admin Panel, create a new user, and choose “Yes” on the API client field.
4. Back on the Network Inspector, click on the request to `/users` with a `200` response.
5. View the response body, find the `secretKey` field, and keep it safe!

This secret key is used as the password in Basic Auth headers sent by API clients. Their permissions are verified based on the user the API client is attached to.

### Viz Builder App

The [Viz Builder App](src/VizBuilderApp) is an interface for creating Tupaia visualisations such as Cartesian charts and pie charts.

It is a standalone app that sits inside the Admin Panel on the `viz-builder` route. It is inside the Admin Panel so that it can use the Admin Panel authentication and to give a more seamless user experience.

The Viz Builder App code is contained from the Admin Panel code so that it can be exported and imported into other apps such as LESMIS if required.

It is also separated from the Admin Panel code so that we can use modern React techniques such as [TanStack Query](https://tanstack.com/query) (formerly React Query).
