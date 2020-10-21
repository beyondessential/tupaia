/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import oauth2 from 'simple-oauth2';

export const authenticateWithDhis = async (serverName, serverUrl) => {
  const getServerVariable = variableName =>
    process.env[`${serverName.toUpperCase()}_${variableName}`] || process.env[variableName];
  const clientId = getServerVariable('DHIS_CLIENT_ID');
  const clientSecret = getServerVariable('DHIS_CLIENT_SECRET');
  const username = getServerVariable('DHIS_USERNAME');
  const password = getServerVariable('DHIS_PASSWORD');

  console.log('serverName', serverName);
  console.log('serverUrl', serverUrl);
  console.log('clientId', clientId);
  console.log('clientSecret', clientSecret);
  console.log('username', username);
  console.log('password', password);
  console.log('=============');

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

  console.log('before oauth2Dhis');

  const oauth2Dhis = oauth2.create(oauth2Settings);

  console.log('oauth2Dhis', oauth2Dhis);

  const result = await oauth2Dhis.ownerPassword.getToken({ username, password });

  console.log('result', result);
  return oauth2Dhis.accessToken.create(result);
};
