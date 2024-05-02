/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
const getAuthenticationState = ({ authentication = {} }) => {
  return authentication;
};

// Login modal details
export const getEmailAddress = state => getAuthenticationState(state).emailAddress;
export const getRememberMe = state => getAuthenticationState(state).rememberMe;
export const getErrorMessage = state => getAuthenticationState(state).errorMessage;
export const getIsLoading = state => getAuthenticationState(state).isLoading;

// Authentication details
export const getIsUserAuthenticated = state => !!getAuthenticationState(state).user;

// User details
export const getUser = state => getAuthenticationState(state).user || {}; // If null, return empty object

// Assume that if a user has any BES Admin access, they are an internal user, to avoid having to check permissions for every country
export const getHasBESAdminPanelAccess = state => {
  const user = getUser(state);
  if (!user || !user.accessPolicy) return false;
  return Object.keys(user.accessPolicy).some(countryCode =>
    user.accessPolicy[countryCode].some(permissionGroupName => permissionGroupName === 'BES Admin'),
  );
};
