# Tupaia Admin

## User Guide

Most aspects are fairly self explanatory, but this guide should cover any tricky bits as they get added

### Creating an Api Client

When creating a new user, you have the option to create them as an api client. When you do this, you have one chance only to retrieve the client secret. The steps for Google Chrome are:

1. Open the inspector (right click, inspect)
2. Select the Network tab
3. On the admin panel, create a new user, and choose "Yes" on the api client field
4. Back on the Network inspector, click on the request to `/users` with a `200` response
5. View the response body, find the `secretKey` field, and keep it safe!

This secret key is used as the password in Basic Auth headers sent by api clients. Their permissions are verified based on the user the api client is attached to.

### Viz Builder App
The Viz Builder App is an interface for creating Tupaia visualisations such as cartesian charts and pie charts. 
It is a standalone app that sits inside the admin panel on the `viz-builder` route.
It is inside the admin panel so that it can use the admin panel authentication and to give a more seamless user experience. 
The Viz Builder App code is contained from the admin panel code so that it can be exported and imported into other apps such as Lesmis if required.
It is also separated from the admin panel code so that we can use modern react techniques such as react-query.