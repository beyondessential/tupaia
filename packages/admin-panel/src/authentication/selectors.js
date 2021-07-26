/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
const getAuthenticationState = ({ authentication = {} }) => authentication;

// Login modal details
export const getEmailAddress = state => getAuthenticationState(state).emailAddress;
export const getPassword = state => getAuthenticationState(state).password;
export const getRememberMe = state => getAuthenticationState(state).rememberMe;
export const getErrorMessage = state => getAuthenticationState(state).errorMessage;

// Authentication details
export const getIsUserAuthenticated = state => !!getAuthenticationState(state).user;

// User details
export const getUser = state => getAuthenticationState(state).user || {}; // If null, return empty object

// BES Admin
export const getIsBESAdmin = state => getAuthenticationState(state).isBESAdmin;
