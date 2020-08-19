import { call, put, take, takeLatest, select } from 'redux-saga/effects';

import request from '../utils/request';

import { setProjects, fetchProjectsError } from './actions';

import {
  FETCH_INITIAL_DATA,
  SET_PROJECT,
  changeBounds,
  changeDashboardGroup,
  FETCH_LOGIN_SUCCESS,
  setOrgUnit,
  FETCH_LOGOUT_SUCCESS,
} from '../actions';
import {
  selectAdjustedProjectBounds,
  selectProjectByCode,
  selectCurrentOrgUnitCode,
  selectCurrentDashboardKey,
} from '../selectors';

function* fetchProjectData() {
  try {
    const { projects } = yield call(request, 'projects', fetchProjectsError);
    yield put(setProjects(projects));
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
  let state = yield select();
  if (state.project.projects.length === 0) {
    yield take('SET_PROJECT_DATA');
  }

  state = yield select();

  yield put(changeBounds(yield select(selectAdjustedProjectBounds, action.projectCode)));

  const project = selectProjectByCode(state, action.projectCode);
  const organisationUnitCode = selectCurrentOrgUnitCode(state);
  if (!organisationUnitCode) {
    yield put(setOrgUnit(project.homeEntityCode || action.projectCode, false));
  }

  // TODO: This will be fixed in the dashboard PR (including standardizing code vs key)
  const dashboardGroupCode = selectCurrentDashboardKey(state);
  if (!dashboardGroupCode) {
    yield put(changeDashboardGroup(project.dashboardGroupName));
  }
}

function* watchSelectProjectAndLoadProjectState() {
  yield takeLatest(SET_PROJECT, loadProject);
}

export default [
  watchFetchInitialDataAndFetchProjects,
  watchSelectProjectAndLoadProjectState,
  watchUserLoginSuccessAndRefetchProjectData,
  watchUserLogoutSuccessAndRefetchProjectData,
];
