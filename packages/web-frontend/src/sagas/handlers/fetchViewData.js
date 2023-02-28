import { call, put, select } from 'redux-saga/effects';
import queryString from 'query-string';

import { selectCurrentProjectCode, selectViewConfig } from '../../selectors';
import { formatDateForApi, getBrowserTimeZone, request } from '../../utils';
import { getDefaultDates } from '../../utils/periodGranularities';

export function* fetchViewData(parameters, errorHandler) {
  const { infoViewKey } = parameters;
  const state = yield select();
  const viewConfig = selectViewConfig(state, infoViewKey);
  // If the view should be constrained to a date range and isn't, constrain it
  const { startDate, endDate } =
    parameters.startDate || parameters.endDate ? parameters : getDefaultDates(viewConfig);

  // Build the request url
  const { organisationUnitCode, dashboardCode, itemCode, isExpanded, extraUrlParameters } =
    parameters;
  const { reportCode, legacy } = viewConfig;
  const urlParameters = {
    organisationUnitCode,
    projectCode: selectCurrentProjectCode(state),
    legacy,
    dashboardCode,
    itemCode,
    isExpanded,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    timeZone: getBrowserTimeZone(),
    ...extraUrlParameters,
  };
  const requestResourceUrl = `report/${reportCode}?${queryString.stringify(urlParameters)}`;

  try {
    return yield call(request, requestResourceUrl, errorHandler);
  } catch (error) {
    let errorMessage = error.message;

    if (error.errorFunction) {
      yield put(error.errorFunction(error));
    }

    if (error.response) {
      const json = yield error.response.json();
      errorMessage = json.error;
    }

    if (errorHandler) {
      yield put(errorHandler(errorMessage, infoViewKey));
    }
  }
  return null;
}
