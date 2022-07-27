import { put } from 'redux-saga/effects';
import { goHome } from '../../../actions';

export function* resetToHome() {
  yield put(goHome());
}
