import { put, takeLatest } from 'redux-saga/effects';
import { clearMapOverlayHierarchy, GO_HOME, setOverlayComponent } from '../../actions';
import { LANDING } from '../../containers/OverlayDiv/constants';
import { DEFAULT_PROJECT_CODE } from '../../defaults';
import { setProject } from '../../projects/actions';

function* resetToProjectSplash() {
  yield put(clearMapOverlayHierarchy());
  yield put(setOverlayComponent(LANDING));
  yield put(setProject(DEFAULT_PROJECT_CODE));
}

export function* watchGoHomeAndResetToProjectSplash() {
  yield takeLatest(GO_HOME, resetToProjectSplash);
}
