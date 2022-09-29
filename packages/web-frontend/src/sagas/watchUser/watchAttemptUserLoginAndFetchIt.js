import { call, put, takeLatest } from 'redux-saga/effects';
import { ATTEMPT_LOGIN, displayUnverified, fetchUserLoginError, findLoggedIn } from '../../actions';
import { LOGIN_TYPES } from '../../constants';
import { request } from '../../utils';

/**
 * attemptUserLogin
 *
 * Attempt to do a user login and call action on success/fail.
 *
 */
function* attemptUserLogin(action) {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emailAddress: action.emailAddress,
      password: action.password,
    }),
  };

  const requestContext = {
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'login';
  try {
    const response = yield call(
      request,
      requestResourceUrl,
      fetchUserLoginError,
      fetchOptions,
      requestContext,
      false,
    );
    yield put(findLoggedIn(LOGIN_TYPES.MANUAL, response.emailVerified));
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    if (errorMessage?.error === 'Email address not yet verified') {
      yield put(displayUnverified(action.emailAddress));
    } else yield put(error.errorFunction(errorMessage));
  }
}

export function* watchAttemptUserLoginAndFetchIt() {
  yield takeLatest(ATTEMPT_LOGIN, attemptUserLogin);
}
