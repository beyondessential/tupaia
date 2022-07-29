import { takeLatest } from 'redux-saga/effects';
import { LOCATION_CHANGE } from '../../actions';
import { handleLocationChange } from '../handlers';

export function* watchHandleLocationChange() {
  yield takeLatest(LOCATION_CHANGE, handleLocationChange);
}
