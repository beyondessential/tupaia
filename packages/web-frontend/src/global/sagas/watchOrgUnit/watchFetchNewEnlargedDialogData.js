import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  FETCH_ENLARGED_DIALOG_DATA,
  updateEnlargedDialog,
  updateEnlargedDialogError,
} from '../../../actions';
import {
  selectCurrentExpandedViewConfig,
  selectCurrentExpandedViewContent,
  selectCurrentInfoViewKey,
  selectShouldUseDashboardData,
  selectViewConfig,
} from '../../../selectors';
import { getInfoFromInfoViewKey } from '../../../utils';
import { getDefaultDrillDownDates } from '../../../utils/periodGranularities';
import { fetchViewData } from '../handlers';

/**
 * Fetches enlarged dialog data for a given view, drillDown level and date range.
 */
function* fetchEnlargedDialogData(action) {
  const { options } = action;

  const state = yield select();
  if (selectShouldUseDashboardData(state, options)) {
    const viewConfig = selectCurrentExpandedViewConfig(state);
    const viewData = selectCurrentExpandedViewContent(state);
    yield put(updateEnlargedDialog(options, viewConfig, viewData));
    return;
  }

  const {
    startDate,
    endDate,
    infoViewKey,
    drillDownItemKey,
    // drillDown params
    parameterLink,
    parameterValue,
    drillDownLevel,
  } = options;

  const { organisationUnitCode, dashboardCode, itemCode } = getInfoFromInfoViewKey(infoViewKey);

  let parameters = {
    startDate,
    endDate,
    itemCode,
    organisationUnitCode,
    dashboardCode,
    isExpanded: true,
    infoViewKey,
  };

  // Handle extra drillDown params
  if (drillDownLevel > 0) {
    const { global } = yield select();

    const drillDownViewConfig = global.viewConfigs[drillDownItemKey];
    const drillDownDates = getDefaultDrillDownDates(drillDownViewConfig, startDate, endDate);

    parameters = {
      ...parameters,
      infoViewKey: drillDownItemKey,
      itemCode: drillDownViewConfig.code,
      extraUrlParameters: { drillDownLevel, [parameterLink]: parameterValue },
      startDate: drillDownDates.startDate,
      endDate: drillDownDates.endDate,
    };
  }

  const viewData = yield call(fetchViewData, parameters, updateEnlargedDialogError);

  const newState = yield select();
  const newInfoViewKey = selectCurrentInfoViewKey(newState);

  // If the expanded view has changed, don't update the enlargedDialog's viewContent
  if (viewData && newInfoViewKey === infoViewKey) {
    const viewConfig = drillDownLevel
      ? selectViewConfig(state, drillDownItemKey)
      : selectCurrentExpandedViewConfig(state);
    yield put(updateEnlargedDialog(action.options, viewConfig, viewData));
  }
}

export function* watchFetchNewEnlargedDialogData() {
  yield takeLatest(FETCH_ENLARGED_DIALOG_DATA, fetchEnlargedDialogData);
}
