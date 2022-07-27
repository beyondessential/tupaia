import { call, delay, put, select } from 'redux-saga/effects';
import queryString from 'query-string';

import { fetchSearchError, fetchSearchSuccess } from '../../../actions';
import { selectCurrentProjectCode } from '../../../selectors';
import { request } from '../../../utils';

/**
 * fetchSearchData
 *
 * Fetches search results for the search bar
 *
 */
export function* fetchSearchData(action) {
  yield delay(200); // Wait 200 ms in case user keeps typing
  if (action.searchString === '') {
    yield put(fetchSearchSuccess([], false));
  } else {
    const state = yield select();
    const startIndex = state.searchBar.searchResults?.length || 0; // Send start index to allow loading more search results
    const urlParameters = {
      criteria: action.searchString || state.searchBar.searchString,
      limit: 5,
      projectCode: selectCurrentProjectCode(state),
      startIndex,
    };
    const requestResourceUrl = `organisationUnitSearch?${queryString.stringify(urlParameters)}`;
    try {
      const { searchResults, hasMoreResults } = yield call(request, requestResourceUrl);
      yield put(fetchSearchSuccess(searchResults, hasMoreResults));
    } catch (error) {
      yield put(fetchSearchError(error));
    }
  }
}
