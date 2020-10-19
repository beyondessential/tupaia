/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { REHYDRATE } from 'redux-persist';

import { Navigator } from './Navigator';
import { TOGGLE_SIDE_MENU } from './constants';
import { resetToLogin } from './actions';
import { hasVersionUpdated } from '../version';
import { analytics, createReducer } from '../utilities';

export const reducer = (state, action) => {
  if (action.type === REHYDRATE) {
    const { payload = {} } = action;
    // Wipe redux navigation state on version update in case state tree has changed shape
    if (payload.version && hasVersionUpdated(payload.version.currentVersion)) {
      analytics.trackEvent('Wipe rehydrate', { version: payload.version });
      return getStateForAction(resetToLogin(), state);
    }
  }
  return getStateForAction(action, state) || state;
};

// Custom getStateForAction to use routeName as the unique key for each screen. In react-navigation,
// a route's key is used for idempotent navigation, i.e. a route with the same key will only be
// in the stack once. As all of our routes are only on screen once, we can use routeName as the
// unique identifier. Basically this just stops double tapping a button causing two copies of a
// screen.
const getStateForAction = (action, state) =>
  Navigator.router.getStateForAction({ key: action.routeName, ...action }, state);

const sideMenuDefaultState = {
  isOpen: false,
};

const sideMenuStateChanges = {
  [TOGGLE_SIDE_MENU]: ({ isOpen }) => ({
    isOpen,
  }),
};

export const sideMenuReducer = createReducer(sideMenuDefaultState, sideMenuStateChanges);
