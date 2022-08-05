import { call, put, select } from 'redux-saga/effects';
import { setOverlayComponent } from '../../actions';
import {
  LANDING,
  PROJECTS_WITH_LANDING_PAGES,
  PROJECT_LANDING,
} from '../../containers/OverlayDiv/constants';
import { DEFAULT_PROJECT_CODE } from '../../defaults';
import { decodeLocation } from '../../historyNavigation/utils';
import { setProject } from '../../projects/actions';
import { handleUserPage } from './handleUserPage';
import { handleInvalidPermission } from './handleInvalidPermission';
import { URL_COMPONENTS } from '../../historyNavigation';
import { URL_REFRESH_COMPONENTS } from '../constants';

export function* handleLocationChange({ location, previousLocation }) {
  const { project } = yield select();
  const { userPage, projectSelector, ...otherComponents } = decodeLocation(location);

  if (userPage) {
    yield call(handleUserPage, userPage, otherComponents);
    return;
  }

  if (projectSelector) {
    // Set project to explore, this is the default
    yield put(setOverlayComponent(LANDING));
    yield put(setProject(DEFAULT_PROJECT_CODE));
    return;
  }

  const hasAccess = project.projects
    .filter(p => p.hasAccess)
    .find(p => p.code === otherComponents.PROJECT);
  if (!hasAccess) {
    yield call(handleInvalidPermission, { projectCode: otherComponents.PROJECT });
    return;
  }

  const isLandingPageProject = PROJECTS_WITH_LANDING_PAGES[otherComponents[URL_COMPONENTS.PROJECT]];
  if (isLandingPageProject) {
    yield put(setOverlayComponent(PROJECT_LANDING));
  }

  // refresh data if the url has changed
  const previousComponents = decodeLocation(previousLocation);
  for (const [key, value] of Object.entries(URL_REFRESH_COMPONENTS)) {
    const component = otherComponents[key];
    if (component && component !== previousComponents[key]) {
      yield put({ ...value(component), meta: { preventHistoryUpdate: true } });
    }
  }
}
