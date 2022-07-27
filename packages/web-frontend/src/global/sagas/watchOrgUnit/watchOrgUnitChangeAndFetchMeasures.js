import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  CHANGE_ORG_UNIT_SUCCESS,
  clearMeasure,
  fetchMeasuresError,
  fetchMeasuresSuccess,
} from '../../../actions';
import { selectCurrentProjectCode, selectIsProject } from '../../../selectors';
import { request } from '../../../utils';

/**
 * fetchMapOverlayMetadata
 *
 * Fetch map overlay metadata for current orgUnit for the current user. Written to mapOverlayBar State.
 *
 */
function* fetchMapOverlayMetadata(action) {
  const { organisationUnitCode } = action.organisationUnit;
  const state = yield select();
  if (selectIsProject(state, organisationUnitCode)) yield put(clearMeasure());
  const projectCode = selectCurrentProjectCode(state);
  const requestResourceUrl = `measures?organisationUnitCode=${organisationUnitCode}&projectCode=${projectCode}`;
  try {
    const response = yield call(request, requestResourceUrl);

    if (response.measures.length === 0) yield put(clearMeasure());
    yield put(fetchMeasuresSuccess(response));
  } catch (error) {
    yield put(fetchMeasuresError(error));
  }
}

export function* watchOrgUnitChangeAndFetchMeasures() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchMapOverlayMetadata);
}
