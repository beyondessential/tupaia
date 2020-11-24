/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { combineReducers } from 'redux';
import { activeWeek } from './activeWeek';

export const weeklyReports = combineReducers({
  activeWeek,
});

export * from './activeWeek';
