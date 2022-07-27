import { takeLatest } from 'redux-saga/effects';
import { FINISH_USER_SESSION } from '../../../actions';

export function* refreshBrowserWhenFinishingUserSession() {
  yield takeLatest(FINISH_USER_SESSION, () => {
    window.location.reload();
  });
}
