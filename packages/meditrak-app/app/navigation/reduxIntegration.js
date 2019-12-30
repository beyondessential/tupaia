/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import {
  createReduxBoundAddListener,
  createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';

export const NAVIGATION_MIDDLEWARE = createReactNavigationReduxMiddleware(
  'root',
  state => state.nav,
);
export const NAVIGATION_ADD_LISTENER = createReduxBoundAddListener('root');
