/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { combineReducers } from 'redux';
import { country } from './country';
import { site } from './site';
import { activeWeek } from './activeWeek';

export const weeklyReports = combineReducers({
  site,
  country,
  activeWeek,
});

export * from './site';
export * from './country';
export * from './activeWeek';
