# Tupaia Admin

## Code Style

We use [Eslint](https://eslint.org/) to indicate quality and formatting errors in the codebase.

### Code quality

The [Airbnb Style Guide](https://github.com/airbnb/javascript) is used for code quality, other than formatting which is handled by Prettier. Modifications to the default rules are defined in our custom `@beyondessential/eslint-config-beyondessential` package.

### Formatting style

[Prettier](https://prettier.io/) is used for formatting style. `.prettierrc` defines modification to the default rules.
In order to use Prettier in **Visual Studio Code**:

1. Install the `Prettier` plugin
2. Enable the `Editor: Format on Save` setting.
3. You can now format a file either by saving it, or by using the `Format Document` command

## User Guide

Most aspects are fairly self explanatory, but this guide should cover the tricky bits as they get added

### Creating an Api Client

When creating a new user, you have the option to create them as an api client. When you do this, you have one chance only to retrieve the client secret. The steps for Google Chrome are:

1. Open the inspector (right click, inspect)
2. Select the Network tab
3. On the admin panel, create a new user, and choose "Yes" on the api client field
4. Back on the Network inspector, click on the request to `/userAccount` with a `200` response
5. View the response body, find the `secretKey` field, and keep it safe!

This secret key is used as the password in Basic Auth headers sent by api clients. Their permissions are verified based on the user the api client is attached to.
