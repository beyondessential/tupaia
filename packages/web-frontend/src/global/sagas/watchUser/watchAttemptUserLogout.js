import { call, put, takeLatest } from 'redux-saga/effects';
import { ATTEMPT_LOGOUT, fetchUserLogoutError, fetchUserLogoutSuccess } from '../../../actions';
import { request } from '../../../utils';

/**
 * attemptUserLogout
 *
 * Attempt to do a user logout.
 *
 */
function* attemptUserLogout() {
  const requestResourceUrl = 'logout';
  try {
    yield call(request, requestResourceUrl, fetchUserLogoutError);
    yield put(fetchUserLogoutSuccess());
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

export function* watchAttemptUserLogout() {
  yield takeLatest(ATTEMPT_LOGOUT, attemptUserLogout);
}
