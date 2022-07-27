import { takeLatest } from 'redux-saga/effects';
import { FETCH_RESET_TOKEN_LOGIN_SUCCESS } from '../../actions';
import { resetToHome } from './handlers';

export function* watchAttemptTokenLoginSuccess() {
  yield takeLatest(FETCH_RESET_TOKEN_LOGIN_SUCCESS, resetToHome);
}
