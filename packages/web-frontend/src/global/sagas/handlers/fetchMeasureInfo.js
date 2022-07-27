import { call, put, select } from 'redux-saga/effects';
import queryString from 'query-string';

import {
  cancelFetchMeasureData,
  fetchAllMeasureInfoSuccess,
  fetchMeasureInfoError,
  fetchMeasureInfoSuccess,
  setDisplayedMapOverlays,
} from '../../../actions';
import {
  selectCurrentOrgUnitCode,
  selectCurrentProjectCode,
  selectMapOverlayByCode,
  selectOrgUnitCountry,
} from '../../../selectors';
import { formatDateForApi, processMeasureInfo, request } from '../../../utils';
import { getDefaultDates } from '../../../utils/periodGranularities';

/**
 * fetchMeasureInfo
 *
 * Fetches data for a measure and write it to map state by calling fetchMeasureSuccess.
 *
 */
export function* fetchMeasureInfo({ mapOverlayCodes, displayedMapOverlays, overlayConfigs }) {
  const state = yield select();
  const { maxSelectedOverlays } = state.map;
  const organisationUnitCode = selectCurrentOrgUnitCode(state);
  const country = selectOrgUnitCountry(state, organisationUnitCode);
  const countryCode = country ? country.organisationUnitCode : undefined;
  const activeProjectCode = selectCurrentProjectCode(state);
  const updatedDisplayedMapOverlays = [];

  if (!organisationUnitCode) {
    yield put(cancelFetchMeasureData());
    return;
  }

  for (const mapOverlayCode of mapOverlayCodes) {
    const mapOverlayParams = selectMapOverlayByCode(state, mapOverlayCode);
    if (!mapOverlayParams) {
      yield put(cancelFetchMeasureData());
      return;
    }
    const overlayConfig = overlayConfigs && overlayConfigs[mapOverlayCode];
    // If the view should be constrained to a date range and isn't, constrain it
    let { startDate, endDate } = overlayConfig || mapOverlayParams;
    if (!startDate || !endDate) {
      const defaultDates = getDefaultDates(mapOverlayParams);
      startDate = defaultDates.startDate;
      endDate = defaultDates.endDate;
    }

    const urlParameters = {
      mapOverlayCode,
      organisationUnitCode,
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
      shouldShowAllParentCountryResults: countryCode !== activeProjectCode,
      projectCode: activeProjectCode,
    };
    const requestResourceUrl = `measureData?${queryString.stringify(urlParameters)}`;

    try {
      const measureInfoResponse = yield call(request, requestResourceUrl);
      const measureInfo = processMeasureInfo(measureInfoResponse);
      const { measureData, serieses } = measureInfo;
      const { values = [] } = (serieses && serieses[0]) || {};
      // Any non-visible map overlay need to have its orange toggle turned off
      const hasMeasureData = measureData && measureData.length > 0;
      const hasNullValues = values.find(({ value }) => !value || value === 'null');
      if (
        (hasNullValues || hasMeasureData) &&
        displayedMapOverlays &&
        displayedMapOverlays.includes(mapOverlayCode)
      ) {
        updatedDisplayedMapOverlays.push(mapOverlayCode);
      }
      yield put(fetchMeasureInfoSuccess(measureInfo, countryCode));
    } catch (error) {
      yield put(fetchMeasureInfoError(error));
    }
  }

  if (maxSelectedOverlays === 1) {
    yield put(setDisplayedMapOverlays(mapOverlayCodes));
  } else if (displayedMapOverlays) {
    yield put(setDisplayedMapOverlays(updatedDisplayedMapOverlays));
  }
  yield put(fetchAllMeasureInfoSuccess(mapOverlayCodes));
}
