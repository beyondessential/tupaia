/**
 * Tupaia
 * Copyright (c) 2022 Beyond Essential Systems Pty Ltd
 */
const getAuthenticationState = ({ authentication = {} }) => authentication;

// Login modal details
export const getEmailAddress = state => getAuthenticationState(state).emailAddress;
export const getPassword = state => getAuthenticationState(state).password;
export const getRememberMe = state => getAuthenticationState(state).rememberMe;
export const getErrorMessage = state => getAuthenticationState(state).errorMessage;
export const getIsLoading = state => getAuthenticationState(state).isLoading;

// Authentication details
export const getIsUserAuthenticated = state => !!getAuthenticationState(state).user;
