/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import thunk from 'redux-thunk';
import { applyMiddleware } from 'redux';
import { NAVIGATION_MIDDLEWARE } from './navigation';

export const createMiddleware = thunkArguments =>
  applyMiddleware(NAVIGATION_MIDDLEWARE, thunk.withExtraArgument(thunkArguments));
