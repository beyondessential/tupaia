import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchEmailVerifyError,
  openEmailVerifiedPage,
  setOverlayComponent,
  SET_VERIFY_EMAIL_TOKEN,
} from '../../../actions';
import { request } from '../../../utils';

function* attemptVerifyToken(action) {
  const { verifyEmailToken } = action;
  const requestResourceUrl = `verifyEmail?emailToken=${verifyEmailToken}`;
  try {
    yield call(request, requestResourceUrl);
    yield put(openEmailVerifiedPage());
    yield put(setOverlayComponent('landing'));
  } catch (error) {
    yield put(fetchEmailVerifyError());
    yield put(setOverlayComponent('landing'));
  }
}

export function* watchSetVerifyEmailToken() {
  yield takeLatest(SET_VERIFY_EMAIL_TOKEN, attemptVerifyToken);
}
