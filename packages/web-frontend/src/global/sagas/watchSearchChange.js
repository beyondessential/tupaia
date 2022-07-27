import { takeLatest } from 'redux-saga/effects';
import { CHANGE_SEARCH } from '../../actions';
import { fetchSearchData } from './handlers';

export function* watchSearchChange() {
  yield takeLatest(CHANGE_SEARCH, fetchSearchData);
}
