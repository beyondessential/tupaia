/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import {
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
  createReduxContainer,
} from 'react-navigation-redux-helpers';
import { REHYDRATE } from 'redux-persist';
import { connect } from 'react-redux';
import { Navigator } from './Navigator';
import { hasVersionUpdated } from '../version';

const reducer = createNavigationReducer(Navigator);
export const navReducer = (state, action) => {
  const { type, payload } = action;
  if (type === REHYDRATE && payload) {
    const versionDidUpdate = payload.version && hasVersionUpdated(payload.version.currentVersion);
    if (versionDidUpdate) {
      return reducer(null, action);
    }
  }
  return reducer(state, action);
};

const NavigationReduxContainer = createReduxContainer(Navigator);
const mapStateToProps = state => ({
  state: state.nav,
});

export const NavigationConnectedApp = connect(mapStateToProps)(NavigationReduxContainer);

export const createNavigationMiddleware = () =>
  createReactNavigationReduxMiddleware(state => state.nav);
