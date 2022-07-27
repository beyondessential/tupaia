import { takeLatest } from 'redux-saga/effects';
import { CHANGE_ORG_UNIT_SUCCESS } from '../../actions';
import { fetchCurrentMeasureInfo } from './handlers';

// Ensures current measure remains selected on new org unit fetch
export function* watchChangeOrgUnitSuccess() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchCurrentMeasureInfo);
}
