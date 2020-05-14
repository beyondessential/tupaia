/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { exampleReducer } from './store';
import { reducer as authenticationReducer } from './authentication';

export const createReducers = () => ({
  example: exampleReducer,
  authentication: authenticationReducer,
});
