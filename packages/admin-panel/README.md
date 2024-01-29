# @tupaia/admin-panel

Frontend interface for the [Admin Panel](https://admin.tupaia.org/) web app.

## User Guide

Most aspects are fairly self explanatory, but this guide should cover any tricky bits as they get added

### Importing geojson

Documentation for importing geojson can be found [here](doc/importingNewGeojson.md)

### Creating an Api Client

When creating a new user, you have the option to create them as an api client. The users are intended for external api usage. Their credentials and permissions are based on the user the api client is attached to.

### Viz Builder App

The Viz Builder App is an interface for creating Tupaia visualisations such as cartesian charts and pie charts.
It is a standalone app that sits inside the admin panel on the `viz-builder` route.
It is inside the admin panel so that it can use the admin panel authentication and to give a more seamless user experience.
The Viz Builder App code is contained from the admin panel code so that it can be exported and imported into other apps such as Lesmis if required.
It is also separated from the admin panel code so that we can use modern react techniques such as react-query.
