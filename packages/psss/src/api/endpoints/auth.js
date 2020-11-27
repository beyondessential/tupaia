/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { get, put, post } from './api';
import { getEntitiesAllowed } from '../store';

const PSSS_API_URL = process.env.REACT_APP_PSSS_API_URL;
const CLIENT_BASIC_AUTH_HEADER = process.env.REACT_APP_CLIENT_BASIC_AUTH_HEADER;

export const authenticate = async loginCredentials => {
  const response = await post(`${PSSS_API_URL}/auth`, {
    data: loginCredentials,
    headers: {
      Authorization: CLIENT_BASIC_AUTH_HEADER,
    },
  });
  const { accessToken, refreshToken, user } = response;
  if (!accessToken || !refreshToken || !user) {
    throw new Error('Invalid response from auth server');
  }

  const entitiesAllowed = getEntitiesAllowed({ auth: { user } });
  if (entitiesAllowed.length === 0) {
    throw new Error(
      'Your permissions for Tupaia do not allow you to view the Pacific Syndromic Surveillance System',
    );
  }
  return response;
};

export const getUser = () => get(`${PSSS_API_URL}/me`);

export const updateUser = data =>
  put(`${PSSS_API_URL}/me`, {
    data,
  });

export const updatePassword = data => post(`${PSSS_API_URL}/me/changePassword`, { data });
