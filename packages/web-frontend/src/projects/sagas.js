import { call, put, takeLatest, select } from 'redux-saga/effects';

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
import { selectAdjustedProjectBounds, selectProjectByCode } from '../selectors';

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
  const state = yield select();
  const project = selectProjectByCode(state, action.projectCode);
  // TODO: Maybe use getCurrentProject here
  yield put(changeBounds(yield select(selectAdjustedProjectBounds, action.projectCode)));
  yield put(changeOrgUnit(action.projectCode));
  yield put(changeDashboardGroup(project.dashboardGroupName));
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
