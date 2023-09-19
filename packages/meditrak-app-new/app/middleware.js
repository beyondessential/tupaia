/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import thunk from 'redux-thunk';
import { applyMiddleware } from 'redux';
import { createNavigationMiddleware } from './navigation';

export const createMiddleware = thunkArguments =>
  applyMiddleware(createNavigationMiddleware(), thunk.withExtraArgument(thunkArguments));
