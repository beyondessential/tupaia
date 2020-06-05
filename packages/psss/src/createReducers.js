/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { combineReducers } from 'redux';
import { auth } from './store';

export const createReducers = combineReducers({
  auth,
});

// export const createReducers = () => ({
//   auth,
// });
