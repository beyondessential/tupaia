/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { createTransform } from 'redux-persist';
import { createReducer } from '../utilities';
import {
  VIZ_BUILDER_USER_PERMISSION_GROUP,
  EMAIL_ADDRESS_CHANGE,
  PASSWORD_CHANGE,
  LOGIN_MODAL_TOGGLE,
  REMEMBER_ME_CHANGE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
  PROFILE_SUCCESS,
} from './constants';

const defaultState = {
  emailAddress: '',
  password: '',
  user: null,
  isLoading: false,
  rememberMe: false,
  errorMessage: null,
};

export const RememberMeTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  inboundState => (inboundState.rememberMe ? inboundState : defaultState),
  // transform state being rehydrated
  outboundState => outboundState,
  // define which reducers this transform gets called for.
  { whitelist: ['authentication'] },
);

const logoutStateUpdater = (payload, currentState) => ({
  ...defaultState, // Clear all authentication details
  ...payload, // Add any details from the payload
  emailAddress: currentState.emailAddress, // But, remember user's email address
});

export const reduceIsVizBuilderUser = policy => {
  return new AccessPolicy(policy).allowsSome(undefined, VIZ_BUILDER_USER_PERMISSION_GROUP);
};

const stateChanges = {
  [LOGIN_MODAL_TOGGLE]: payload => payload,
  [EMAIL_ADDRESS_CHANGE]: payload => payload,
  [PASSWORD_CHANGE]: payload => payload,
  [REMEMBER_ME_CHANGE]: payload => payload,
  [LOGIN_SUCCESS]: (payload, currentState) => {
    return {
      ...defaultState,
      ...payload,
      rememberMe: currentState.rememberMe,
      emailAddress: currentState.emailAddress,
      password: currentState.password,
      isVizBuilderUser: reduceIsVizBuilderUser(payload.user.accessPolicy),
    };
  },
  [LOGIN_REQUEST]: () => ({ isLoading: true }),
  [LOGIN_ERROR]: logoutStateUpdater,
  [LOGOUT]: logoutStateUpdater,
  [PROFILE_SUCCESS]: (user, currentState) => ({
    user: {
      ...currentState.user,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      position: user.position,
      employer: user.employer,
      profileImage: user.profile_image,
    },
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
