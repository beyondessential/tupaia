import { select, takeLatest } from 'redux-saga/effects';
import { SET_MAP_OVERLAYS } from '../../../actions';
import { selectCurrentMapOverlayCodes } from '../../../selectors';
import { fetchMeasureInfo } from '../handlers';

export function* watchSetMapOverlayChange() {
  yield takeLatest(SET_MAP_OVERLAYS, function* _() {
    const state = yield select();
    const mapOverlayCodes = selectCurrentMapOverlayCodes(state);
    const { displayedMapOverlays, measureInfo } = state.map;

    // We need to make sure previous hidden or unhidden overlays stay the same way as they did.
    const previousDisplayedOverlays = displayedMapOverlays.filter(code =>
      mapOverlayCodes.includes(code),
    );
    const newSelectedMapOverlays = mapOverlayCodes.filter(code => !measureInfo[code]);

    yield fetchMeasureInfo({
      mapOverlayCodes,
      displayedMapOverlays: [...previousDisplayedOverlays, ...newSelectedMapOverlays],
    });
  });
}
