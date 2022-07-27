import { takeLatest } from 'redux-saga/effects';
import { FETCH_LOGOUT_SUCCESS } from '../../actions';
import { resetToHome } from './handlers';

export function* watchLogoutSuccess() {
  yield takeLatest(FETCH_LOGOUT_SUCCESS, resetToHome);
}
