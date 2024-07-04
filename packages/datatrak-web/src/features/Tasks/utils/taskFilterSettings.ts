/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import Cookies from 'js-cookie';

type FilterType = 'all_assignees' | 'all_completed' | 'all_cancelled';

export const getTaskFilterSetting = (cookieName: FilterType): boolean => {
  return Cookies.get(cookieName) === 'true';
};

export const setTaskFilterSetting = (cookieName: FilterType, value: boolean) => {
  return Cookies.set(cookieName, value);
};
