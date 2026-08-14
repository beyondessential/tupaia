# @tupaia/admin-panel

Frontend interface for the [Admin Panel](https://admin.tupaia.org) web app.

## User Guide

Most aspects are fairly self explanatory, but this guide should cover any tricky bits as they get added.

### Creating a custom dashboard (end user)

1. **Open the Admin Panel with Viz Builder access**  
   Sign in at `admin.tupaia.org` and make sure your account is in the “Viz Builder User” permission group. Without it you won’t see the “Add dashboard item” button or the builder screens that follow.

2. **Create dashboard cards in Viz Builder**  
   - Go to **Visualisations → Dashboard items** and click **Add dashboard item**.  
   - Give the card a unique code, a short name your audience will recognise, choose the permission group that should see it, and pick the visualisation type (chart, table, statistic, etc.).  
   - After selecting **Create**, the Viz Builder opens. The left panel lets you choose data steps either through the point-and-click Transform Library or by switching to the JSON editor for fine-grained control.  
   - Above the preview area you can choose a **project, location, and date range** or upload a small `.json` test file so the preview uses the same data your users will see.  
   - Press the blue **Play** button whenever you want to refresh the preview. Use the **Data Preview** tab to confirm the raw numbers and the **Chart Preview** tab to view the finished card. You can toggle between a guided presentation editor (with an AI assistant) and raw JSON if you need to make precise tweaks.  
   - When you are happy, click **Save**, confirm in the modal, and stay on the page or jump back to the Admin Panel once the success message appears.

3. **Create or reuse a dashboard container**  
   - In **Visualisations → Dashboards**, add a dashboard if one doesn’t already exist for your project. Provide the dashboard code, display name, the “Organisation unit code” (the country or project the dashboard belongs to), and optionally a sort order for where it shows up in the menu.

4. **Attach cards to the dashboard**  
   - Still within the Dashboards view, open the nested **Dashboard relations** table for the dashboard you just created (or use the main **Visualisations → Dashboard relations** view).  
   - Choose the saved dashboard item, then set who should see it by selecting permission groups, entity types (e.g. country, district, facility), and project codes. Use the sort order column to arrange the cards from top to bottom.  
   - Save each relation. As soon as these are in place and the users refresh Tupaia, the new dashboard card appears anywhere the selected project, location, and permissions overlap.

5. **Optional: email summaries**  
   If you want automated emails for the dashboard, add the card to a **Dashboard mailing list** from the same Visualisations section. Otherwise no further action is needed—the dashboard is now live in the Tupaia interface.

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
