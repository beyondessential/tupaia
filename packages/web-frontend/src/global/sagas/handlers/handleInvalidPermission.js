import { put, select } from 'redux-saga/effects';
import { setOverlayComponent } from '../../../actions';
import { LANDING } from '../../../containers/OverlayDiv/constants';
import { setRequestingAccess } from '../../../projects/actions';
import { selectProjectByCode } from '../../../selectors';

export function* handleInvalidPermission({ projectCode }) {
  const state = yield select();
  const { isUserLoggedIn } = state.authentication;

  if (isUserLoggedIn) {
    // show project access dialog
    const project = selectProjectByCode(state, projectCode);

    if (Object.keys(project).length > 0) {
      yield put(setRequestingAccess(project));
      yield put(setOverlayComponent('requestProjectAccess'));
      return;
    }

    // handle 404s
    // Todo: handle 404s. Issue: https://github.com/beyondessential/tupaia-backlog/issues/1474
    // eslint-disable-next-line no-console
    console.error('project does not exist - 404');
    return;
  }
  // show login dialog
  yield put(setOverlayComponent(LANDING));
}
