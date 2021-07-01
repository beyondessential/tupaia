import { call, put, take, takeLatest, select } from 'redux-saga/effects';

import request from '../utils/request';
import { setProjects, fetchProjectsError } from './actions';

import { SET_PROJECT, setOrgUnit, FETCH_LOGOUT_SUCCESS } from '../actions';
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

function* watchUserLogoutSuccessAndRefetchProjectData() {
  yield takeLatest(FETCH_LOGOUT_SUCCESS, fetchProjectData);
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

export default [watchSelectProjectAndLoadProjectState, watchUserLogoutSuccessAndRefetchProjectData];
