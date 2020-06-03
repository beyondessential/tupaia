import { call, put, takeLatest, select } from 'redux-saga/effects';

import request from '../utils/request';

import { setProjects, fetchProjectsError, selectProject } from './actions';

import {
  FETCH_INITIAL_DATA,
  SELECT_PROJECT,
  changeBounds,
  changeDashboardGroup,
  FETCH_LOGIN_SUCCESS,
  requestOrgUnit,
  FETCH_LOGOUT_SUCCESS,
} from '../actions';
import { INITIAL_PROJECT_CODE } from '../defaults';
import { selectAdjustedProjectBounds } from '../selectors';

function* fetchProjectData() {
  try {
    const { projects } = yield call(request, 'projects', fetchProjectsError);
    yield put(setProjects(projects));
    yield put(selectProject(projects.find(p => p.code === INITIAL_PROJECT_CODE)));
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

function* watchSelectProjectAndLoadProjectState() {
  // eslint-disable-next-line func-names
  yield takeLatest(SELECT_PROJECT, function*(action) {
    yield put(changeBounds(yield select(selectAdjustedProjectBounds, action.project.code)));
    yield put(changeDashboardGroup(action.project.dashboardGroupName));
    yield put(requestOrgUnit(action.project.code));
  });
}

export default [
  watchFetchInitialDataAndFetchProjects,
  watchSelectProjectAndLoadProjectState,
  watchUserLoginSuccessAndRefetchProjectData,
  watchUserLogoutSuccessAndRefetchProjectData,
];
