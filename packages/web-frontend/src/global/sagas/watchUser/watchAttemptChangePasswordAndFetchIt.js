import { call, put, takeLatest } from 'redux-saga/effects';
import {
  ATTEMPT_CHANGE_PASSWORD,
  fetchChangePasswordError,
  fetchChangePasswordSuccess,
} from '../../../actions';
import { request } from '../../../utils';

/**
 * attemptChangePassword
 *
 * Attempt to change a user's password and call action on success/fail.
 *
 */
function* attemptChangePassword(action) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oldPassword: action.oldPassword,
      password: action.password,
      passwordConfirm: action.passwordConfirm,
      oneTimeLoginToken: action.passwordResetToken,
    }),
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'changePassword';
  try {
    yield call(request, requestResourceUrl, fetchChangePasswordError, options);
    yield put(fetchChangePasswordSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(error.errorFunction(errorMessage.details ? errorMessage.details : ''));
  }
}

export function* watchAttemptChangePasswordAndFetchIt() {
  yield takeLatest(ATTEMPT_CHANGE_PASSWORD, attemptChangePassword);
}
