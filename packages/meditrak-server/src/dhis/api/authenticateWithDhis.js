/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import oauth2 from 'simple-oauth2';

export async function authenticateWithDhis(serverUrl) {
  const { DHIS_USERNAME, DHIS_PASSWORD, DHIS_CLIENT_ID, DHIS_CLIENT_SECRET } = process.env;

  const oauth2Settings = {
    client: {
      id: DHIS_CLIENT_ID,
      secret: DHIS_CLIENT_SECRET,
    },
    auth: {
      tokenHost: serverUrl,
      tokenPath: '/uaa/oauth/token',
    },
  };
  const oauth2Dhis = oauth2.create(oauth2Settings);

  const result = await oauth2Dhis.ownerPassword.getToken({
    username: DHIS_USERNAME,
    password: DHIS_PASSWORD,
  });
  return oauth2Dhis.accessToken.create(result);
}
