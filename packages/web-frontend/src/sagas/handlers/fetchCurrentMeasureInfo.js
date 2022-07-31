import { put, select } from 'redux-saga/effects';
import { setMapOverlays } from '../../actions';
import {
  selectCurrentMapOverlayCodes,
  selectCurrentOrgUnitCode,
  selectDefaultMapOverlayCode,
} from '../../selectors';
import { checkHierarchyIncludesMapOverlayCodes } from '../../utils';

export function* fetchCurrentMeasureInfo() {
  const state = yield select();
  const currentOrganisationUnitCode = selectCurrentOrgUnitCode(state);
  const { mapOverlayHierarchy } = state.mapOverlayBar;
  const selectedMapOverlayCodes = selectCurrentMapOverlayCodes(state);

  if (currentOrganisationUnitCode) {
    if (!checkHierarchyIncludesMapOverlayCodes(mapOverlayHierarchy, selectedMapOverlayCodes)) {
      const defaultMapOverlayCode = selectDefaultMapOverlayCode(state);
      yield put(setMapOverlays(defaultMapOverlayCode));
    } else {
      yield put(setMapOverlays(selectedMapOverlayCodes.join(',')));
    }
  }
}
