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
    console.log('starting the try for fetching dashboard item info');
    yield put(fetchDashboardItemEditOptions());
    // Build the request url
    const requestResourceUrl = 'dashboardItems';
    const dashboardItemData = yield call(request, requestResourceUrl);
    console.log('dashboardItemdata', dashboardItemData);
    // TODO: add fetch success action and reducer
    yield put(fetchDashboardItemEditOptionsSuccess(dashboardItemData));
    console.log('about to return dashboardItemData');
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
