/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getBrowserTimeZone } from '@tupaia/utils';
import { get, put, post } from '../api';

export const loginUser = credentials =>
  post('login', {
    data: {
      ...credentials,
      deviceName: window.navigator.userAgent,
      timezone: getBrowserTimeZone(),
    },
  });

export const logoutUser = async () => {
  try {
    await post('logout');
  } catch (e) {
    // don't display logout error
    console.warn('There was an error clearing the session cookie');
  }
};

export const getUser = () => get('me');

export const updateUser = data =>
  put('me', {
    data,
  });

export const updatePassword = data => post('me/changePassword', { data });

export const doTest = () => get('test');
