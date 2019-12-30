# tupaia-web

Web app that integrates with and displays data from the Tupaia project.

# Open Source Information

## Open Source Mission statement

> By engaging and collaborating with our community we can deliver a more robust product that bridges cultural differences and empowers decision making within health systems worldwide.

## Code of Conduct

For contributor's code of conduct - see the [code-of-conduct.md](https://gitlab.com/beyond-essential/tupaia-config-server/blob/master/code-of-conduct.md) published in the repo.

# Development

### Supported Browsers

Targeted browsers are:

- Chrome
- Firefox
- IE11 and newer

### Tools

- Visual Studio Code: Our preferred text/code editor. Good extensions as follows
- - Yarn: Basically does the job of 'npm' in terminal but faster and smarter
- - Prettier: Use this to format your code according (currently optional, but not for long!(?))
- - ESLint
- - Reactjs code snippets
- - React-Native/React/Redux snippets for es6/es7
- - JavaScript (ES6) code snippets
- Github Desktop (or how ever you like to manage your git)

### Backend

For any charts/measures to load any data, basically anything to work, you need need a config server providing the API for tupaia-web. There are 2 options

#### Point at a remote server

Create a .env file in the root directory of the project if you haven't already. Add the following line if you want to connect to the dev server:

```
REACT_APP_CONFIG_SERVER_BASE_URL = https://dev-config.tupaia.org/api/v1/
```

or add the following line if you want to connect to the live server:

```
REACT_APP_CONFIG_SERVER_BASE_URL = https://config.tupaia.org/api/v1/
```

The default is http://localhost:8080/api/v1/.

#### Host the backend locally

[Instructions are here](https://github.com/sussol/tupaia-config-server) for running config server and a docker instance of the DHIS2 aggregation server. You shouldn't need to change LOCAL_URL as above, as the existing localhost address and port should be the default local/dev address for tupaia-config-server.

# Tupaia Ubuntu/Server common operations

tupaia-web is hosted on an EC2 instance along with the backend, the following instructions require you to have access as follows.
All operations start @ ubuntu user, [How to remote server](https://github.com/sussol/dhis2-server-side/blob/master/Documentation/ec2DetailsAndSSH.md)

### Updating Tupaia-Web

- In the server, enter git repository:
  `cd ~/repos/tupaia-web`
- First update git repository (described in section **Update Git repository**)
- Check memory in use - if has less than 500mb stop tomcat (described in section **TOMCAT-DHIS**)
- Rebuild the static files for nginx to serve:

```
yarn install
yarn build
```

- If you stoped tomcat - start it over. It will take a few time to restart in meanwhile Tupaia will stop showing organisation units. Don't panic!

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
