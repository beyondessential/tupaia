/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export const API_CLIENT_NAME = 'meditrak-app-server@tupaia.org';
export const API_CLIENT_PASSWORD = 'test_api_client_password';

export const CAT_USER = {
  firstName: 'Cat',
  lastName: 'Meow',
  email: 'cat@cathouse.com',
  password: 'dogbad',
};
export const CAT_USER_SESSION = { email: 'cat@cathouse.com', refresh_token: 'cat_dog' };

const USERS = [CAT_USER];

const SESSIONS = [CAT_USER_SESSION];

export const TEST_DATA = {
  users: USERS,
  sessions: SESSIONS,
};
