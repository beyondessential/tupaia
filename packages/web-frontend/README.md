# @tupaia/web-frontend

Web app that integrates with and displays data from the Tupaia project.

# Open Source Information

## Open Source Mission statement

> By engaging and collaborating with our community we can deliver a more robust product that bridges cultural differences and empowers decision making within health systems worldwide.

## Code of Conduct

For contributor's code of conduct - see the [code-of-conduct.md](https://gitlab.com/beyond-essential/tupaia/blob/master/code-of-conduct.md) published in the repo.

# Development

### Supported Browsers

Targeted browsers are:

- Chrome
- Firefox
- IE11 and newer

### Tools

- Visual Studio Code: Our preferred text/code editor. Good extensions as follows
- - Yarn: Basically does the job of 'npm' in terminal but faster and smarter
- - Reactjs code snippets
- - React-Native/React/Redux snippets for es6/es7
- - JavaScript (ES6) code snippets
- Github Desktop (or how ever you like to manage your git)

### Backend

For any charts/measures to load any data, basically anything to work, you need need a config server providing the API for web-frontend. There are 2 options

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

[Instructions are here](https://github.com/beyondessential/tupaia/blob/dev/packages/web-config-server/README.md) for running config server and a docker instance of the DHIS2 aggregation server. You shouldn't need to change LOCAL_URL as above, as the existing localhost address and port should be the default local/dev address for web-config-server.
