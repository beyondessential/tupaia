import oauth2 from 'simple-oauth2';

export const authenticateWithDhis = async (serverName, serverUrl) => {
  const getServerVariable = variableName =>
    process.env[`${serverName.toUpperCase()}_${variableName}`] || process.env[variableName];
  const clientId = getServerVariable('DHIS_CLIENT_ID');
  const clientSecret = getServerVariable('DHIS_CLIENT_SECRET');
  const username = getServerVariable('DHIS_USERNAME');
  const password = getServerVariable('DHIS_PASSWORD');

  const tokenHost = getServerVariable('DHIS_AUTH_TOKEN_HOST') || serverUrl;
  const tokenPath = getServerVariable('DHIS_AUTH_TOKEN_PATH') || '/uaa/oauth/token';

  const oauth2Settings = {
    client: {
      id: clientId,
      secret: clientSecret,
    },
    auth: {
      tokenHost,
      tokenPath,
    },
  };
  const oauth2Dhis = oauth2.create(oauth2Settings);

  const result = await oauth2Dhis.ownerPassword.getToken({ username, password });

  return oauth2Dhis.accessToken.create(result);
};
