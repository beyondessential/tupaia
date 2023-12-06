/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';

import { CreateUserPage } from './CreateUserPage';
import { changeUserField, createUser } from './actions';
import { USER_AGREE_TERMS } from './constants';
import * as userFieldConstants from './userFieldConstants';
import { getUserFieldValue, getErrorMessage, getIsLoading, getInvalidFields } from './selectors';
import { resetToLogin } from '../navigation/actions';

function mapStateToProps(state) {
  return {
    formFieldValues: {
      [userFieldConstants.USER_FIRST_NAME_KEY]: getUserFieldValue(
        userFieldConstants.USER_FIRST_NAME_KEY,
        state,
      ),
      [userFieldConstants.USER_LAST_NAME_KEY]: getUserFieldValue(
        userFieldConstants.USER_LAST_NAME_KEY,
        state,
      ),
      [userFieldConstants.USER_EMAIL_KEY]: getUserFieldValue(
        userFieldConstants.USER_EMAIL_KEY,
        state,
      ),
      [userFieldConstants.USER_PASSWORD_KEY]: getUserFieldValue(
        userFieldConstants.USER_PASSWORD_KEY,
        state,
      ),
      [userFieldConstants.USER_PASSWORD_CONFIRM_KEY]: getUserFieldValue(
        userFieldConstants.USER_PASSWORD_CONFIRM_KEY,
        state,
      ),
      [userFieldConstants.USER_CONTACT_NUMBER_KEY]: getUserFieldValue(
        userFieldConstants.USER_CONTACT_NUMBER_KEY,
        state,
      ),
      [userFieldConstants.USER_EMPLOYER_KEY]: getUserFieldValue(
        userFieldConstants.USER_EMPLOYER_KEY,
        state,
      ),
      [userFieldConstants.USER_POSITION_KEY]: getUserFieldValue(
        userFieldConstants.USER_POSITION_KEY,
        state,
      ),
      [USER_AGREE_TERMS]: getUserFieldValue(USER_AGREE_TERMS, state),
    },
    errorMessage: getErrorMessage(state),
    isLoading: getIsLoading(state),
    invalidFields: getInvalidFields(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onPressCancel: () => dispatch(resetToLogin()),
    onChangeNewUserField: (fieldName, fieldValue) => {
      dispatch(changeUserField(fieldName, fieldValue));
    },
    onSubmitFields: fields => dispatch(createUser(fields)),
  };
}

const CreateUserContainer = connect(mapStateToProps, mapDispatchToProps)(CreateUserPage);

export { CreateUserContainer };
