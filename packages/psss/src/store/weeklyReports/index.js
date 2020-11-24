/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { combineReducers } from 'redux';
import { country } from './country';
import { activeWeek } from './activeWeek';

export const weeklyReports = combineReducers({
  country,
  activeWeek,
});

export * from './country';
export * from './activeWeek';
