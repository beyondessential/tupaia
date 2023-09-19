/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import {
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_FAILURE,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FIELD_CHANGE,
} from './constants';

const defaultState = {
  oldPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
  isLoading: false,
  errorMessage: '',
  invalidFields: [],
};

const stateChanges = {
  [CHANGE_PASSWORD_FIELD_CHANGE]: ({ fieldName, fieldValue }) => ({
    [fieldName]: fieldValue,
  }),
  [CHANGE_PASSWORD_REQUEST]: () => ({
    isLoading: true,
  }),
  [CHANGE_PASSWORD_SUCCESS]: () => defaultState,
  [CHANGE_PASSWORD_FAILURE]: ({ errorMessage, invalidFields }) => ({
    isLoading: false,
    errorMessage,
    invalidFields,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
