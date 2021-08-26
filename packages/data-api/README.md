## @tupaia/data-api

Fetches data from the Tupaia database, in the form of events or analytics.

### Analytics table

Tupaia relies on a database table which we refer to as the 'analytics table'. This table (saved in the database as 'analytics') contains a record for each 'non outdated' analytic in the Tupaia Data Api. The analytics themselves are derived from a number of other database tables (answer, survey_response, etc.) and are built using an SQL query. That query is used to populate the analytics table, and as the underlying records are created/updated/deleted the analytics table automatically refreshes using a module called 'mvrefresh'.

### MV Refresh

'mvrefresh' stands for Materialized View Refresh, and is a postgres module we install in our database who's role is to create and administer the analytics table. The module itself is stored in another git repository (https://github.com/beyondessential/pg-mv-fast-refresh) and you can read more about how it functions here: https://aws.amazon.com/blogs/database/building-fast-refresh-capability-in-amazon-rds-for-postgresql/

Using mvrefresh, we are able to update the analytics table when we receive new changes much faster than with a standard postgres materialized view.

### Installing MV Refresh and the Analytics table

Note: Before installing anything, ensure you have all .env vars set up as per the .env.example

Before creating the analytics table, we must install mvrefresh. Run:

`yarn workspace @tupaia/data-api install-mv-refresh`

Once installation is complete, you can check the module is installed by looking in your database and checking that a 'mvrefresh' schema is present. Inside there should be a few tables, and a large number of functions prefixed with 'mv$'.

Now that mvrefresh is installed, we can build the analytics table. Run:

`yarn workspace @tupaia/data-api build-analytics-table`

This process may take some time (~20 minutes on feature instances). First the script must build the 'log$\_' tables, which track changes in the source tables that the analytics table relies on (answer, survey_response, etc.) Then the table itself must be built, and finally it must be indexed.

Once this process is complete, you can check the analytics table is present in your 'public' schema in the database.

### Uninstallation

Removing the analytics table may sometimes be necessary when creating a test database dump, or making configuration changes. Run:

`yarn workspace @tupaia/data-api drop-analytics-table`

If you wish, you can also uninstall mvrefresh from your database entirely. Run:

`yarn workspace @tupaia/data-api uninstall-mv-refresh`

Note: You must drop the analytics table before uninstalling mvrefresh.

### Refreshing the Analytics table

The analytics table will be automatically updated ('refreshed') by the meditrak-server whenever changes come in to the answer, or survey_response tables. However, there may be times when you wish to refresh the analytics table yourself. To do this you have a couple of options:

- `yarn workspace @tupaia/data-api refresh-analytics-table` - Performs a 'fast refresh' which update the table with the latest deltas. This is usually what you want.

- `yarn workspace @tupaia/data-api refresh-analytics-table --full` - Performs a 'full refresh' which will fully repopulate the analytics table from scratch. This process will ensure that the data in the analytics table is correct, however usually takes much longer than a fast refresh.

### Rebuilding the analytics table

You may need to rebuild the analytics once it has been build, if for instance the analytics table schema has been changed. There are a couple of ways to do this:

- `yarn workspace @tupaia/data-api build-analytics-table --force` - Force rebuilds the analytics table on top of an existing analytics table. This process builds the new analytics table in the background and then swaps them once it's complete, allowing for the data-api to be available the whole time.

- `yarn workspace @tupaia/data-api drop-analytics-table && yarn workspace @tupaia/data-api build-analytics-table` - Fully reinstalls the analytics table and underlying log tables in the database.
