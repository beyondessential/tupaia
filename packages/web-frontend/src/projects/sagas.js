import { call, put, take, takeLatest, select } from 'redux-saga/effects';

import request from '../utils/request';

import { setProjects, fetchProjectsError } from './actions';

import {
  FETCH_INITIAL_DATA,
  ON_SET_PROJECT,
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

  // QUESTION: We need to make sure projects are loaded before we try and select one, I think the below works but is there a better way?
  if (!(state.project.projects.length > 0)) {
    yield take('SET_PROJECT_DATA');
  }

  state = yield select();
  const project = selectProjectByCode(state, action.projectCode);

  const organisationUnitCode = selectCurrentOrgUnitCode(state);
  yield put(changeBounds(yield select(selectAdjustedProjectBounds, action.projectCode)));
  if (!organisationUnitCode) {
    yield put(setOrgUnit(project.homeEntityCode || action.projectCode, false));
  }

  // TODO: This will be fixed in the dashboard PR
  const dashboardGroupCode = selectCurrentDashboardKey(state);
  if (!dashboardGroupCode) {
    yield put(changeDashboardGroup(project.dashboardGroupName));
  }
}

function* watchSelectProjectAndLoadProjectState() {
  // eslint-disable-next-line func-names
  yield takeLatest(ON_SET_PROJECT, loadProject);
}

export default [
  watchFetchInitialDataAndFetchProjects,
  watchSelectProjectAndLoadProjectState,
  watchUserLoginSuccessAndRefetchProjectData,
  watchUserLogoutSuccessAndRefetchProjectData,
];
