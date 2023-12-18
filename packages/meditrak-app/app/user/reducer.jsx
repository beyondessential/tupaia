/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import {
  CREATE_USER_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  USER_AGREE_TERMS,
  USER_FIELD_CHANGE,
} from './constants';
import * as userFieldConstants from './userFieldConstants';

const defaultState = {
  [userFieldConstants.USER_FIRST_NAME_KEY]: '',
  [userFieldConstants.USER_LAST_NAME_KEY]: '',
  [userFieldConstants.USER_EMAIL_KEY]: '',
  [userFieldConstants.USER_PASSWORD_KEY]: '',
  [userFieldConstants.USER_PASSWORD_CONFIRM_KEY]: '',
  [userFieldConstants.USER_CONTACT_NUMBER_KEY]: '',
  [userFieldConstants.USER_EMPLOYER_KEY]: '',
  [userFieldConstants.USER_POSITION_KEY]: '',
  [USER_AGREE_TERMS]: false,
  isLoading: false,
  errorMessage: '',
  invalidFields: [],
};

const stateChanges = {
  [USER_FIELD_CHANGE]: ({ fieldName, fieldValue }) => ({
    [fieldName]: fieldValue,
  }),
  [CREATE_USER_REQUEST]: () => ({
    isLoading: true,
  }),
  [CREATE_USER_SUCCESS]: () => defaultState,
  [CREATE_USER_FAILURE]: ({ errorMessage, invalidFields }) => ({
    isLoading: false,
    errorMessage,
    invalidFields,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
