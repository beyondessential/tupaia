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
