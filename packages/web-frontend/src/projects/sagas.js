import { call, put, take, takeLatest, select } from 'redux-saga/effects';

import request from '../utils/request';

import { setProjects, fetchProjectsError, setProject } from './actions';

import {
  FETCH_INITIAL_DATA,
  ON_SET_PROJECT,
  changeBounds,
  changeDashboardGroup,
  FETCH_LOGIN_SUCCESS,
  setOrgUnit,
  FETCH_LOGOUT_SUCCESS,
} from '../actions';
import { INITIAL_PROJECT_CODE } from '../defaults';
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
    // yield put(setProject(INITIAL_PROJECT_CODE));
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
  // -How to do the below properly?
  let state = yield select();

  if (!(state.project.projects.length > 0)) {
    yield take('SET_PROJECT_DATA');
  }

  state = yield select();
  const project = selectProjectByCode(state, action.projectCode) || {};

  const organisationUnitCode = selectCurrentOrgUnitCode(state);
  yield put(changeBounds(yield select(selectAdjustedProjectBounds, action.projectCode)));
  if (!organisationUnitCode || action.forceChangeOrgUnit) {
    yield put(setOrgUnit(project.homeEntityCode || action.projectCode, false));
  }
  const dashboardGroupCode = selectCurrentDashboardKey(state);
  if (!dashboardGroupCode || action.forceChangeOrgUnit) {
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
