/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';
import { getIsUserAuthenticated } from '../authentication';

export const userIsAuthenticated = connectedRouterRedirect({
  redirectPath: '/permission-denied',
  authenticatedSelector: getIsUserAuthenticated,
  wrapperDisplayName: 'UserIsAuthenticated',
});

const locationHelper = locationHelperBuilder({});
export const userIsNotAuthenticated = connectedRouterRedirect({
  redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/surveys',
  allowRedirectBack: false,
  authenticatedSelector: state => !getIsUserAuthenticated(state),
  wrapperDisplayName: 'UserIsNotAuthenticated',
});
