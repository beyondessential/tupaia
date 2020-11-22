/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { combineReducers } from 'redux';
import { auth } from './auth';
import { weeklyReports } from './weeklyReports';

export const rootReducer = combineReducers({ auth, weeklyReports });
