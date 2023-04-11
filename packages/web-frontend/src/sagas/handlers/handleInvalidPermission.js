import { put, select } from 'redux-saga/effects';
import { setOverlayComponent } from '../../actions';
import { LANDING, REQUEST_PROJECT_ACCESS } from '../../containers/OverlayDiv/constants';
import { setRequestingAccess } from '../../projects/actions';
import { selectProjectByCode } from '../../selectors';

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
