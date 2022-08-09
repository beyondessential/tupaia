import { call, put, takeLatest } from 'redux-saga/effects';
import {
  ATTEMPT_REQUEST_COUNTRY_ACCESS,
  fetchRequestCountryAccessError,
  fetchRequestCountryAccessSuccess,
} from '../../actions';
import { fetchProjectData } from '../../projects/sagas';
import { request } from '../../utils';

/**
 * requestCountryAccess
 *
 * Attempt to request country access for the logged in user and call action on success/fail.
 *
 */
function* requestCountryAccess(action) {
  const { message, projectCode } = action;
  const entityIds = action.entityIds ? Object.keys(action.entityIds) : [];

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entityIds,
      message,
      projectCode,
    }),
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'requestCountryAccess';
  try {
    yield call(request, requestResourceUrl, fetchRequestCountryAccessError, options);
    yield put(fetchRequestCountryAccessSuccess());
    yield call(fetchProjectData);
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(error.errorFunction(errorMessage.details ? errorMessage.details : ''));
  }
}

export function* watchAttemptRequestCountryAccessAndFetchIt() {
  yield takeLatest(ATTEMPT_REQUEST_COUNTRY_ACCESS, requestCountryAccess);
}
