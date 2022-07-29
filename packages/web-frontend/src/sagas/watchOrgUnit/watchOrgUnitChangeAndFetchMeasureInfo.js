import { put, select, takeLatest } from 'redux-saga/effects';
import { CHANGE_ORG_UNIT_SUCCESS, setMapOverlays } from '../../actions';
import { selectCurrentMapOverlayCodes } from '../../selectors';

function* fetchMeasureInfoForNewOrgUnit(action) {
  const { countryCode } = action.organisationUnit;
  const state = yield select();
  const mapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const oldOrgUnitCountry = state.map.currentCountry;
  if (oldOrgUnitCountry === countryCode) {
    // We are in the same country as before, no need to refetch measureData
    return;
  }

  if (mapOverlayCodes.length > 0) {
    yield put(setMapOverlays(mapOverlayCodes.join(',')));
  }
}

export function* watchOrgUnitChangeAndFetchMeasureInfo() {
  yield takeLatest(CHANGE_ORG_UNIT_SUCCESS, fetchMeasureInfoForNewOrgUnit);
}
