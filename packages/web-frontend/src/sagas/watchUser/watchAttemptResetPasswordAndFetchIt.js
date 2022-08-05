import { call, put, takeLatest } from 'redux-saga/effects';
import {
  ATTEMPT_RESET_PASSWORD,
  fetchResetPasswordError,
  fetchResetPasswordSuccess,
} from '../../actions';
import { request } from '../../utils';

/**
 * attemptResetPassword
 *
 * Attempt to send a reset password email and call action on success/fail.
 *
 */
function* attemptResetPassword(action) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailAddress: action.email }),
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'resetPassword';
  try {
    yield call(request, requestResourceUrl, fetchResetPasswordError, options);
    yield put(fetchResetPasswordSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(error.errorFunction(errorMessage.details ? errorMessage.details : ''));
  }
}

export function* watchAttemptResetPasswordAndFetchIt() {
  yield takeLatest(ATTEMPT_RESET_PASSWORD, attemptResetPassword);
}
