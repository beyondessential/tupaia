import { call, put, take } from 'redux-saga/effects';
import { fetchUserLoginSuccess, FETCH_INITIAL_DATA, findUserLoginFailed } from '../../../actions';
import { LOGIN_TYPES } from '../../../constants';
import { getInitialLocation } from '../../../historyNavigation';
import { clearLocation } from '../../../historyNavigation/historyNavigation';
import { fetchProjectData } from '../../../projects/sagas';
import request from '../../../utils/request';
import { handleLocationChange } from '../handlers';

export function* watchFetchInitialData() {
  yield take(FETCH_INITIAL_DATA);

  // Login must happen first so that projects return the correct access flags
  yield call(findUserLoggedIn, LOGIN_TYPES.AUTO);
  yield call(fetchProjectData);
  yield call(handleLocationChange, {
    location: getInitialLocation(),
    previousLocation: clearLocation(),
  });
}

/**
 * findUserLoggedIn
 *
 * Find if any user was logged in and call action on success/fail.
 *
 */
function* findUserLoggedIn(action) {
  const requestResourceUrl = 'getUser';

  try {
    const userData = yield call(request, requestResourceUrl);
    if (userData.name !== 'public') {
      yield put(fetchUserLoginSuccess(userData.name, userData.email, action.loginType));
    } else {
      yield put(findUserLoginFailed());
    }
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}
