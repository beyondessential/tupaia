import { call, put, takeLatest } from 'redux-saga/effects';
import { ATTEMPT_SIGNUP, fetchUserSignupError, fetchUserSignupSuccess } from '../../../actions';
import { request } from '../../../utils';

/**
 * attemptUserSignup
 *
 * Attempt to do a user signup and call action on success/fail.
 *
 */
function* attemptUserSignup(action) {
  const { fields } = action;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  };

  const requestContext = {
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'signup';
  try {
    yield call(
      request,
      requestResourceUrl,
      fetchUserSignupError,
      fetchOptions,
      requestContext,
      false,
    );
    yield put(fetchUserSignupSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(error.errorFunction(errorMessage.details ? errorMessage.details : ''));
  }
}

export function* watchAttemptUserSignupAndFetchIt() {
  yield takeLatest(ATTEMPT_SIGNUP, attemptUserSignup);
}
