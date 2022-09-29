import { call, put, select, takeLatest } from 'redux-saga/effects';
import queryString from 'query-string';

import {
  CHANGE_ORG_UNIT_SUCCESS,
  fetchDashboardError,
  fetchDashboardsSuccess,
  setDashboardGroup,
} from '../../actions';
import {
  selectCurrentDashboardNameFromLocation,
  selectCurrentProject,
  selectCurrentProjectCode,
} from '../../selectors';
import { request } from '../../utils';
import { handleInvalidPermission } from '../handlers';

/**
 * fetchDashboards
 *
 * Fetches a dashboard for the orgUnit given in action
 *
 */
function* fetchDashboards(action) {
  const { organisationUnitCode } = action.organisationUnit;
  const state = yield select();
  const projectCode = selectCurrentProjectCode(state);
  const project = selectCurrentProject(state);
  const currentDashboardName = selectCurrentDashboardNameFromLocation(state);
  const queryParameters = {
    organisationUnitCode,
    projectCode,
  };
  const requestResourceUrl = `dashboards?${queryString.stringify(queryParameters)}`;

  try {
    const dashboards = yield call(request, requestResourceUrl, fetchDashboardError);

    // If there is no dashboard code defined, assign the default if it is valid for the user
    if (!currentDashboardName) {
      const projectDefaultDashboardName = project.dashboardGroupName;
      const presetDefaultDashboard = dashboards.find(
        d => d.dashboardName === projectDefaultDashboardName,
      );
      const defaultDashboard = presetDefaultDashboard || dashboards[0];
      yield put(setDashboardGroup(defaultDashboard.dashboardName));
    } else {
      const dashboard = dashboards.find(d => d.dashboardName === currentDashboardName);
      // Check if the user has permission to view the dashboard
      if (!dashboard) {
        yield call(handleInvalidPermission, { projectCode });
        return;
      }
    }

    yield put(fetchDashboardsSuccess(dashboards));
  } catch (error) {
    console.log('error', error);
    yield put(error.errorFunction(error));
  }
}

export function* watchOrgUnitChangeAndFetchDashboard() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchDashboards);
}
