import { put, select } from 'redux-saga/effects';
import { setOverlayComponent } from '../../actions';
import {
  LANDING,
  PAGE_NOT_FOUND,
  REQUEST_PROJECT_ACCESS,
} from '../../containers/OverlayDiv/constants';
import { setRequestingAccess } from '../../projects/actions';
import { selectProjectByCode } from '../../selectors';

export function* handleInvalidPermission({ projectCode }) {
  const state = yield select();
  const { isUserLoggedIn } = state.authentication;

  if (isUserLoggedIn) {
    // show project access dialog
    const project = selectProjectByCode(state, projectCode);

    if (Object.keys(project).length > 0) {
      // Todo: Handle dashboard does not exist somehow
      yield put(setRequestingAccess(project));
      yield put(setOverlayComponent(REQUEST_PROJECT_ACCESS));
      return;
    }

    yield put(setOverlayComponent(PAGE_NOT_FOUND));
    return;
  }
  // show login dialog
  yield put(setOverlayComponent(LANDING));
}
