/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {
  REWARDS_BALANCE_REQUEST,
  REWARDS_BALANCE_SUCCESS,
  REWARDS_BALANCE_FAILURE,
} from './constants';
import { createReducer } from '../utilities';
import { LOGIN_REQUEST } from '../authentication/constants';

const defaultState = {
  isLoading: false,
  isInitialLoadComplete: false,
  errorMessage: '',
  coconuts: 0,
  pigs: 0,
};

const stateChanges = {
  [LOGIN_REQUEST]: () => ({
    isInitialLoadComplete: false,
    coconuts: 0,
    pigs: 0,
  }),
  [REWARDS_BALANCE_REQUEST]: () => ({
    isLoading: true,
  }),
  [REWARDS_BALANCE_SUCCESS]: ({ coconuts, pigs }) => ({
    isLoading: false,
    isInitialLoadComplete: true,
    errorMessage: defaultState.errorMessage,
    coconuts,
    pigs,
  }),
  [REWARDS_BALANCE_FAILURE]: ({ errorMessage }) => ({
    isLoading: false,
    errorMessage,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
