import { takeLatest } from 'redux-saga/effects';
import { FETCH_MORE_SEARCH_RESULTS } from '../../actions';
import { fetchSearchData } from '../handlers';

export function* watchFetchMoreSearchResults() {
  yield takeLatest(FETCH_MORE_SEARCH_RESULTS, fetchSearchData);
}
