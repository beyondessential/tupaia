import { call, put, take, takeLatest, takeEvery, select } from 'redux-saga/effects';

import request from '../utils/request';

import { setProjects, fetchProjectsError, selectProject } from './actions';

import {
  FETCH_INITIAL_DATA,
  ON_SET_PROJECT,
  changeBounds,
  changeDashboardGroup,
  FETCH_LOGIN_SUCCESS,
  changeOrgUnit,
  FETCH_LOGOUT_SUCCESS,
} from '../actions';
// import { INITIAL_PROJECT_CODE } from '../defaults';
import {
  selectAdjustedProjectBounds,
  selectProjectByCode,
  selectCurrentOrgUnitCode,
  selectCurrentDashboardGroupCode,
} from '../selectors';

function* fetchProjectData() {
  try {
    const { projects } = yield call(request, 'projects', fetchProjectsError);
    yield put(setProjects(projects));
    // yield put(selectProject(INITIAL_PROJECT_CODE)); No need.
  } catch (error) {
    console.error(error);
  }
}

function* watchFetchInitialDataAndFetchProjects() {
  yield takeLatest(FETCH_INITIAL_DATA, fetchProjectData);
}

function* watchUserLoginSuccessAndRefetchProjectData() {
  yield takeLatest(FETCH_LOGIN_SUCCESS, fetchProjectData);
}

function* watchUserLogoutSuccessAndRefetchProjectData() {
  yield takeLatest(FETCH_LOGOUT_SUCCESS, fetchProjectData);
}

function* loadProject(action) {
  // QUESTION:
  // - Make sure projects are loaded, I think the below works
  // - Why not change map bounds on change org unit/ wow the regression
  // - Should we use getCurrentProject here rather than action.projectCode? Advantages/disadvantages?
  //yield call(fetchProjectData);
  // TODO: Nasty hack, not allowed
  if (!action.forceChangeOrgUnit) {
    yield take('SET_PROJECT_DATA');
  }

  const state = yield select();
  const project = selectProjectByCode(state, action.projectCode) || {};

  const organisationUnitCode = selectCurrentOrgUnitCode(state);
  yield put(changeBounds(yield select(selectAdjustedProjectBounds, action.projectCode)));
  if (!organisationUnitCode || action.forceChangeOrgUnit) {
    yield put(changeOrgUnit(project.homeEntityCode || action.projectCode, false));
  }
  const dashboardGroupCode = selectCurrentDashboardGroupCode(state);
  if (!dashboardGroupCode || action.forceChangeOrgUnit) {
    yield put(changeDashboardGroup(project.dashboardGroupName));
  }
}

function* watchSelectProjectAndLoadProjectState() {
  yield takeLatest(ON_SET_PROJECT, loadProject);
}

export default [
  watchFetchInitialDataAndFetchProjects,
  watchSelectProjectAndLoadProjectState,
  watchUserLoginSuccessAndRefetchProjectData,
  watchUserLogoutSuccessAndRefetchProjectData,
];
