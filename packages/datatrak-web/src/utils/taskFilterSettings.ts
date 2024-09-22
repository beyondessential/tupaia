/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import Cookies from 'js-cookie';
import { TaskFilterType } from '../types';

export const getTaskFilterSetting = (cookieName: TaskFilterType): boolean => {
  return Cookies.get(cookieName) === 'true';
};

const isDev = process.env.NODE_ENV === 'development';
export const setTaskFilterSetting = (cookieName: TaskFilterType, value: boolean) => {
  // Set the cookie to expire overnight.
  // The cookie is also manually cleared on logout @see useLogout.ts
  const today = new Date();
  today.setHours(24, 0, 0, 0); // next midnight

  return Cookies.set(cookieName, value, {
    expires: today,
    // This is needed so that the cookies can be shared across subdomains in deployed environments
    ...(!isDev && { domain: '.tupaia.org' }),
  });
};

export const removeTaskFilterSetting = (cookieName: TaskFilterType): boolean => {
  return Cookies.remove(cookieName, {
    ...(!isDev && { domain: '.tupaia.org' }),
  });
};
