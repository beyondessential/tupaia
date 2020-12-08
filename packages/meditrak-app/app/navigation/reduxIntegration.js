/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import {
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
  createReduxContainer,
} from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';
import { Navigator } from './Navigator';

export const navReducer = createNavigationReducer(Navigator);

const NavigationReduxContainer = createReduxContainer(Navigator);
const mapStateToProps = state => ({
  state: state.nav,
});

export const NavigationConnectedApp = connect(mapStateToProps)(NavigationReduxContainer);

export const createNavigationMiddleware = () =>
  createReactNavigationReduxMiddleware(state => state.nav);
