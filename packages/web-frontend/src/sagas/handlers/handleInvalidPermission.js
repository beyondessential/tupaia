import { call, put, select } from 'redux-saga/effects';
import { fetchCountryAccessDataError, setOverlayComponent } from '../../actions';
import {
  LANDING,
  PAGE_NOT_FOUND,
  REQUEST_PROJECT_ACCESS,
} from '../../containers/OverlayDiv/constants';
import { setRequestingAccess } from '../../projects/actions';
import { selectCurrentDashboardNameFromLocation, selectProjectByCode } from '../../selectors';
import { request } from '../../utils';

export function* handleInvalidPermission({ projectCode }) {
  const state = yield select();
  const { isUserLoggedIn } = state.authentication;

  if (isUserLoggedIn) {
    const project = selectProjectByCode(state, projectCode);

    // show project access dialog
    if (Object.keys(project).length > 0) {
      yield put(setRequestingAccess(project));
      yield put(setOverlayComponent(REQUEST_PROJECT_ACCESS));
      return;
    }
  }
  // show login dialog
  yield put(setOverlayComponent(LANDING));
}
