import { call, put } from 'redux-saga/effects';
import { fetchDashboardItemEditOptions, fetchDashboardItemEditOptionsSuccess } from '../../actions';
import { request } from '../../utils';

/**
 * fetchDashboardItemEditOptions
 *
 * Fetch all dashboard items from database.
 *
 */
export function* fetchDashboardItemEditOptionsData() {
  try {
    yield put(fetchDashboardItemEditOptions());
    // Build the request url
    const requestResourceUrl = 'dashboardItems';
    const dashboardItemData = yield call(request, requestResourceUrl);
    // TODO: add fetch success action and reducer
    yield put(fetchDashboardItemEditOptionsSuccess(dashboardItemData));
    return;
  } catch (error) {
    if (error.errorFunction) {
      yield put(error.errorFunction(error));
    }
    // TODO: add fetch success action and reducer
    // e.g. yield put(fetchOrgUnitError(organisationUnitCode, error.message));

    throw error;
  }
}
