/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';

export const createNavigationMiddleware = () =>
  createReactNavigationReduxMiddleware(state => state.nav);
