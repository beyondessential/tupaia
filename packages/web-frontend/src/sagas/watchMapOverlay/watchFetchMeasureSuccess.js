// Ensures current measure remains selected in the case that the new org unit

import { takeLatest } from 'redux-saga/effects';
import { FETCH_MEASURES_SUCCESS } from '../../actions';
import { fetchCurrentMeasureInfo } from '../handlers';

// was selected before measures finished fetching
export function* watchFetchMeasureSuccess() {
  yield takeLatest(FETCH_MEASURES_SUCCESS, fetchCurrentMeasureInfo);
}
