import { call, put, select } from 'redux-saga/effects';
import {
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
  fetchCountryAccessDataError,
  fetchCountryAccessDataSuccess,
  REQUEST_PROJECT_ACCESS,
  setOverlayComponent,
} from '../../actions';
import { request } from '../../utils';
import { PAGE_NOT_FOUND } from '../../containers/OverlayDiv/constants';

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
    const state = yield select();

    const names = state.project.requestingAccess.names;
    const hasAllProjectAccess = countries
      .filter(c => names.includes(c.name))
      .every(c => c.hasAccess && c.accessRequests.length === 0);

    // If already has all project access, then show a page not found message rather the permission
    // request form
    if (hasAllProjectAccess) {
      yield put(setOverlayComponent(PAGE_NOT_FOUND));
    }

    yield put(fetchCountryAccessDataSuccess(countries));
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}
