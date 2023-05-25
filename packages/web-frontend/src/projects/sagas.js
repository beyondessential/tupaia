import { call, put, take, takeLatest, select } from 'redux-saga/effects';

import request from '../utils/request';
import { setProjects, fetchProjectsError } from './actions';

import {
  SET_PROJECT,
  setOrgUnit,
  FETCH_LOGOUT_SUCCESS,
  FETCH_LANDING_PAGE_LOGOUT_SUCCESS,
  SET_CUSTOM_LANDING_PAGE_DATA,
  CUSTOM_LANDING_PAGE_LOADING,
} from '../actions';
import { selectProjectByCode, selectCurrentOrgUnitCode } from '../selectors';

export function* fetchProjectData() {
  try {
    const { projects } = yield call(request, 'projects', fetchProjectsError);
    yield put(setProjects(projects));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

export function* fetchCustomLandingPageData() {
  try {
    yield put({
      type: CUSTOM_LANDING_PAGE_LOADING,
      isLoading: true,
    });
    const { routing: location } = yield select();
    const urlSegment = location.pathname.split('/')[1];

    if (urlSegment) {
      const data = yield call(request, `landingPage/${urlSegment}`);
      yield put({
        type: SET_CUSTOM_LANDING_PAGE_DATA,
        data,
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    yield put({
      type: CUSTOM_LANDING_PAGE_LOADING,
      isLoading: false,
    });
  }
}

function* watchUserLogoutSuccessAndRefetchProjectData() {
  yield takeLatest(FETCH_LOGOUT_SUCCESS, fetchProjectData);
}

function* watchLandingPageLogoutSuccessAndRefetchProjectData() {
  yield takeLatest(FETCH_LANDING_PAGE_LOGOUT_SUCCESS, fetchProjectData);
}

function* loadProject(action) {
  let state = yield select();
  if (state.project.projects.length === 0) {
    yield take('SET_PROJECT_DATA');
  }

  state = yield select();
  // If the project was set in the url, preserve the other parameters if they are
  // also set
  const forceUpdate = !(action.meta && action.meta.preventHistoryUpdate);

  const project = selectProjectByCode(state, action.projectCode);

  const organisationUnitCode = selectCurrentOrgUnitCode(state);
  if (!organisationUnitCode || forceUpdate) {
    yield put(setOrgUnit(project.homeEntityCode || action.projectCode));
  }
}

function* watchSelectProjectAndLoadProjectState() {
  yield takeLatest(SET_PROJECT, loadProject);
}

export default [
  watchSelectProjectAndLoadProjectState,
  watchUserLogoutSuccessAndRefetchProjectData,
  watchLandingPageLogoutSuccessAndRefetchProjectData,
];
