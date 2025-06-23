export const createBasicHeader = (username, password) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

export const createBearerHeader = accessToken => `Bearer ${accessToken}`;
