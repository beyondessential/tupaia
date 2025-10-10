import DeviceInfo from 'react-native-device-info';
import {
  CREATE_USER_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  USER_FIELD_CHANGE,
  USER_AGREE_TERMS,
} from './constants';

import * as userFieldNames from './userFieldConstants';
import { login } from '../authentication/actions';
import { resetToLogin } from '../navigation/actions';

export const changeUserField = (fieldName, fieldValue) => ({
  type: USER_FIELD_CHANGE,
  fieldName,
  fieldValue,
});

export const requestCreateUser = () => ({
  type: CREATE_USER_REQUEST,
});

export const receiveCreateError = (errorMessage, invalidFields = []) => ({
  type: CREATE_USER_FAILURE,
  errorMessage,
  invalidFields,
});

export const createUserSuccess = () => ({
  type: CREATE_USER_SUCCESS,
});

/**
 * Attempts to log in to server using credentials entered by user. If successful, begins a sync to
 * get the latest data (which may be all data if this is the first time the user has logged in)
 */
export const createUser =
  userFields =>
  async (dispatch, getState, { api, analytics }) => {
    dispatch(requestCreateUser());

    const fields = {
      ...userFields,
      deviceName: await DeviceInfo.getDeviceName(),
    };

    const invalidFields = [];

    Object.keys(userFieldNames).forEach(fieldConstant => {
      const fieldName = userFieldNames[fieldConstant];

      if (!fields[fieldName]) {
        invalidFields.push(fieldName);
      }
    });

    if (invalidFields.length > 0) {
      return dispatch(receiveCreateError('Please complete all required fields.', invalidFields));
    }

    if (!fields[USER_AGREE_TERMS]) {
      return dispatch(receiveCreateError('Please agree to the terms and conditions.'));
    }

    let response;
    try {
      response = await api.createUser(fields);
      if (response.error) throw new Error(response.error);
    } catch (error) {
      return dispatch(receiveCreateError(error.message));
    }

    // Log user in.
    dispatch(createUserSuccess());

    const email = userFields[userFieldNames.USER_EMAIL_KEY];
    const password = userFields[userFieldNames.USER_PASSWORD_KEY];

    dispatch(resetToLogin());
    return dispatch(login(email, password));
  };
