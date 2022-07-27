import { takeLatest } from 'redux-saga/effects';
import { REQUEST_PROJECT_ACCESS } from '../../../actions';
import { fetchCountryAccessDataIfRequired } from '../handlers';

export function* watchRequestProjectAccess() {
  yield takeLatest(REQUEST_PROJECT_ACCESS, fetchCountryAccessDataIfRequired);
}
