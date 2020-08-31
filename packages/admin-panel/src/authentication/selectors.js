/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

const getAuthenticationState = ({ authentication = {} }) => authentication;

// Login modal details
export const getEmailAddress = state => getAuthenticationState(state).emailAddress;
export const getPassword = state => getAuthenticationState(state).password;
export const getErrorMessage = state => getAuthenticationState(state).errorMessage;
export const getIsLoginModalOpen = state => !getIsUserAuthenticated(state);

// Authentication details
export const getIsUserAuthenticated = state => !!getAuthenticationState(state).user;
export const getAccessToken = state => getAuthenticationState(state).accessToken;
export const getRefreshToken = state => getAuthenticationState(state).refreshToken;

// User details
export const getUser = state => getAuthenticationState(state).user || {}; // If null, return empty object
export const getUserFullName = state => getUser(state).name;
