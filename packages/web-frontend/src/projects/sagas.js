import { call, put, takeLatest } from 'redux-saga/effects';

import request from '../utils/request';

import { setProjects, fetchProjectsError, setProjectDefaults, selectProject } from './actions';

import {
  FETCH_INITIAL_DATA,
  SELECT_PROJECT,
  changeBounds,
  FETCH_LOGIN_SUCCESS,
  fetchDashboardSuccess,
  fetchDashboardError,
} from '../actions';
import { INITIAL_PROJECT_CODE } from '../defaults';

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

function* watchSelectProjectAndLoadProjectState() {
  // eslint-disable-next-line func-names
  yield takeLatest(SELECT_PROJECT, function*(action) {
    yield put(changeBounds(action.project.bounds));
    yield put(setProjectDefaults(action.project));
    const { code } = action.project;
    if (code !== 'General' && code !== 'explore' && code !== 'disaster') {
      const requestResourceUrl = `dashboard?organisationUnitCode=${code}`;

      try {
        const dashboard = yield call(request, requestResourceUrl, fetchDashboardError);
        yield put(fetchDashboardSuccess(dashboard));
      } catch (error) {
        yield put(error.errorFunction(error));
      }
    }
  });
}

export default [
  watchFetchInitialDataAndFetchProjects,
  watchSelectProjectAndLoadProjectState,
  watchUserLoginSuccessAndRefetchProjectData,
];
