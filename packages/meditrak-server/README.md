# meditrak-server

Backend for the MediTrak health facility survey and mapping software

## Running Locally

- Need to have the following installed
  - Node
  - yarn
- Add a .env file to the root directory. The required variables are listed in `.env.example`
- `yarn` (to install dependencies)
- `yarn start-dev` to run in dev mode or `yarn start` to build and run production

## Local database

By default, the DB_URL in the .env file will point to the database on the dev server. However, this
can easily become confusing if multiple meditrak-server instances are changing data, so it's nicer
to run a local database.

Meditrak server actually uses exactly the same db as web-config-server, so if you've already set
that up, you don't need to do anything except change the .env DB_URL and DISABLE_SSL variables

If you haven't yet set up the db "tupaia", do the following (and note that you won't need to do this
again if you work on web-config-server):

Set up postgres on your machine and create the database 'tupaia', with credentials matching those in
the .env file.

The project requires importing an initial database dump. This can be obtained from the `#latest-db` channel
on Slack. Import the dump by running:

```bash
psql tupaia -U tupaia < tupaia_dump.sql
```

### Importing geojson

Documentation for importing geojson can be found [here](src/documentation/importingNewGeojson.md)
