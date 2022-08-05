import { takeLatest } from 'redux-saga/effects';
import { OPEN_USER_DIALOG } from '../../actions';
import { fetchCountryAccessDataIfRequired } from '../handlers';

export function* watchFetchCountryAccessDataAndFetchIt() {
  yield takeLatest(OPEN_USER_DIALOG, fetchCountryAccessDataIfRequired);
}
