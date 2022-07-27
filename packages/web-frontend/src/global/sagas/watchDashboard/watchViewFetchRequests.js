import { call, put, select, takeEvery } from 'redux-saga/effects';
import {
  fetchDashboardItemDataError,
  fetchDashboardItemDataSuccess,
  FETCH_INFO_VIEW_DATA,
} from '../../../actions';
import { fetchDisasterDateRange } from '../../../disaster/sagas';
import { selectCurrentProjectCode } from '../../../selectors';
import { fetchViewData } from '../handlers';

/**
 * fetchDashboardItemData
 *
 * Fetches a dashboard for the orgUnit given in action
 *
 */
function* fetchDashboardItemData(action) {
  const { infoViewKey } = action;
  const state = yield select();
  const project = selectCurrentProjectCode(state);

  // Run preparation saga if it exists to collect module specific url parameters
  let extraUrlParameters = {};
  if (project === 'disaster') {
    extraUrlParameters = yield call(fetchDisasterDateRange);
  }

  const viewData = yield call(
    fetchViewData,
    { ...action, extraUrlParameters },
    fetchDashboardItemDataError,
  );
  if (viewData) {
    yield put(fetchDashboardItemDataSuccess(viewData, infoViewKey));
  }
}

export function* watchViewFetchRequests() {
  // By using `takeEvery` fetches for different views will be run simultaneously.
  // It returns task descriptor (just like fork) so we can continue execution
  yield takeEvery(FETCH_INFO_VIEW_DATA, fetchDashboardItemData);
}
