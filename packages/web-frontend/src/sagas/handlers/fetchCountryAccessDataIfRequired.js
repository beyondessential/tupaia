import { call, put } from 'redux-saga/effects';
import {
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  fetchCountryAccessDataError,
  fetchCountryAccessDataSuccess,
  REQUEST_PROJECT_ACCESS,
} from '../../actions';
import { request } from '../../utils';

/**
 * fetchCountryAccessData
 *
 * Fetches a list of all countries and the user's access to them
 *
 */
export function* fetchCountryAccessDataIfRequired(action) {
  // If the dialog page being opened was not the request country access page, don't bother fetching
  if (
    action.dialogPage !== DIALOG_PAGE_REQUEST_COUNTRY_ACCESS &&
    action.type !== REQUEST_PROJECT_ACCESS
  ) {
    return;
  }
  const requestResourceUrl = 'countryAccessList';
  try {
    const countries = yield call(request, requestResourceUrl, fetchCountryAccessDataError);
    yield put(fetchCountryAccessDataSuccess(countries));
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}
