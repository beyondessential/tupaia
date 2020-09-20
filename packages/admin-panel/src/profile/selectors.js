/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

const getProfileState = ({ profile = {} }) => profile;

export const getFirstName = state => getProfileState(state).firstName;
export const getLastName = state => getProfileState(state).lastName;
export const getRole = state => getProfileState(state).role;
export const getEmployer = state => getProfileState(state).employer;
export const getErrorMessage = state => getProfileState(state).errorMEssage;
