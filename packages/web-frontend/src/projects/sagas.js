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
    console.log('fetching data');
    const { projects } = yield call(request, 'projects', fetchProjectsError);
    yield put(setProjects(projects));
    console.log('success!');
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
  console.log('loadProject', action);
  //yield call(fetchProjectData);
  // TODO: Nasty hack, not allowed
  if (!action.forceChangeOrgUnit) {
    yield take('SET_PROJECT_DATA');
  }
  console.log('loadProject passed fetchProjectData', action);

  const state = yield select();
  const project = selectProjectByCode(state, action.projectCode) || {};
  console.log('loadProject passed fetchProjectData', state, project);

  const organisationUnitCode = selectCurrentOrgUnitCode(state);
  console.log(organisationUnitCode);
  yield put(changeBounds(yield select(selectAdjustedProjectBounds, action.projectCode)));
  console.log('loadProject passed 1', project, project.homeEntityCode || action.projectCode);
  if (!organisationUnitCode || action.forceChangeOrgUnit) {
    yield put(changeOrgUnit(project.homeEntityCode || action.projectCode, false));
  }
  console.log('loadProject passed 2');
  const dashboardGroupCode = selectCurrentDashboardGroupCode(state);
  if (!dashboardGroupCode || action.forceChangeOrgUnit) {
    yield put(changeDashboardGroup(project.dashboardGroupName));
  }
  console.log('loadProject passed everything', action);
}

function* watchSelectProjectAndLoadProjectState() {
  yield takeLatest(ON_SET_PROJECT, loadProject);
}

async function asyncFunc() {
  return new Promise(resolve => setTimeout(resolve, 1000, 'hi'));
  // Won't resolve or reject
}

function* neverReturns() {
  console.log('starting never returns');
  while (true) {
    const hi = yield asyncFunc('args');
    console.log('It returned: ', hi);
  }
}

function* watchSelectProjectAndPrint() {
  yield takeLatest(ON_SET_PROJECT, neverReturns);
  // prints 'starting never returns' THE RIGHT NUMBER OF TIMES
}

function* watchSelectProjectAndPrint2() {
  yield takeLatest(ON_SET_PROJECT, () => console.log('ON_SET_PROJECT'));
  // prints ON_SET_PROJECT many times
}

export default [
  watchFetchInitialDataAndFetchProjects,
  watchSelectProjectAndLoadProjectState,
  watchUserLoginSuccessAndRefetchProjectData,
  watchUserLogoutSuccessAndRefetchProjectData,
  //watchSelectProjectAndPrint,
  //watchSelectProjectAndPrint2,
];
