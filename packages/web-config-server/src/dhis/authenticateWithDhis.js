/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import oauth2 from 'simple-oauth2';
import { Dhis2Error } from '/errors';

export const authenticateWithDhis = async (serverName, serverUrl) => {
  const getServerVariable = variableName =>
    process.env[`${serverName.toUpperCase()}_${variableName}`] || process.env[variableName];
  const clientId = getServerVariable('DHIS_OAUTH_CLIENT_NAME');
  const clientSecret = getServerVariable('DHIS_OAUTH_CLIENT_SECRET');
  const username = getServerVariable('DHIS_OAUTH_USERNAME');
  const password = getServerVariable('DHIS_OAUTH_PASSWORD');
  try {
    const oauth2Settings = {
      client: {
        id: clientId,
        secret: clientSecret,
      },
      auth: {
        tokenHost: serverUrl,
        tokenPath: '/uaa/oauth/token',
      },
    };
    const oauth2Dhis = oauth2.create(oauth2Settings);

    const result = await oauth2Dhis.ownerPassword.getToken({ username, password });

    return oauth2Dhis.accessToken.create(result);
  } catch (error) {
    throw new Dhis2Error(error, `authentication against ${serverUrl} for ${username}`); // Error authenticating with DHIS2, throw up
  }
};
