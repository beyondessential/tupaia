/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import Cookies from 'js-cookie';
import { TaskFilterType } from '../types';

export const getTaskFilterSetting = (cookieName: TaskFilterType): boolean => {
  return Cookies.get(cookieName) === 'true';
};

export const setTaskFilterSetting = (cookieName: TaskFilterType, value: boolean) => {
  // Set the cookie to expire in 365 days. The cookie is also manually cleared on logout. see useLogout.ts
  return Cookies.set(cookieName, value, { expires: 365 });
};
