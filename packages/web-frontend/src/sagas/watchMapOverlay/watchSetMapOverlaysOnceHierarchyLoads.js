import { take, put, select, takeLatest } from 'redux-saga/effects';
import {
  FETCH_MEASURES_SUCCESS,
  setOverlayConfigs,
  SET_MAP_OVERLAYS_ONCE_HIERARCHY_LOADS,
} from '../../actions';
import { convertUrlPeriodStringToDateRange, DEFAULT_PERIOD } from '../../historyNavigation';
import {
  selectCurrentMapOverlayCodes,
  selectCurrentMapOverlayPeriods,
  selectPeriodGranularityByCode,
} from '../../selectors';
import { fetchMeasureInfo } from '../handlers';

export function* watchSetMapOverlaysOnceHierarchyLoads() {
  yield takeLatest(SET_MAP_OVERLAYS_ONCE_HIERARCHY_LOADS, function* _() {
    yield take(FETCH_MEASURES_SUCCESS);
    const state = yield select();
    const currentOverlayCodes = selectCurrentMapOverlayCodes(state);
    const currentOverlayPeriods = selectCurrentMapOverlayPeriods(state);
    const overlayConfigs = {};

    for (let index = 0; index < currentOverlayCodes.length; index++) {
      const currentOverlayCode = currentOverlayCodes[index];
      const currentOverlayPeriod = currentOverlayPeriods[index];

      if (currentOverlayPeriod === DEFAULT_PERIOD) {
        overlayConfigs[currentOverlayCode] = {};
        continue;
      }

      const periodGranularity = selectPeriodGranularityByCode(state, currentOverlayCode);
      const { startDate, endDate } = convertUrlPeriodStringToDateRange(
        currentOverlayPeriod,
        periodGranularity,
      );
      overlayConfigs[currentOverlayCode] = { startDate, endDate };
    }

    yield put(setOverlayConfigs(overlayConfigs));
    yield fetchMeasureInfo({
      mapOverlayCodes: currentOverlayCodes,
      displayedMapOverlays: currentOverlayCodes,
    });
  });
}
