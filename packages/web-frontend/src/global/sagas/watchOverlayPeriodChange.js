import { select, takeLatest } from 'redux-saga/effects';
import { UPDATE_OVERLAY_CONFIGS } from '../../actions';
import { selectCurrentMapOverlayCodes } from '../../selectors';
import { fetchMeasureInfo } from './handlers';

export function* watchOverlayPeriodChange() {
  yield takeLatest(UPDATE_OVERLAY_CONFIGS, function* _(action) {
    const state = yield select();
    const mapOverlayCodes = selectCurrentMapOverlayCodes(state);
    yield fetchMeasureInfo({ mapOverlayCodes, overlayConfigs: action.overlayConfigs });
  });
}
