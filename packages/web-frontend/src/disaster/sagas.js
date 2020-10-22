/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { call, put, takeLatest, take, select } from 'redux-saga/effects';

import request from '../utils/request';

import { fetchDisastersError, setDisastersData, selectDisaster } from './actions';

import {
  SELECT_DISASTER,
  VIEW_DISASTER,
  SET_DISASTERS_DATA,
  FETCH_INITIAL_DATA,
  changeBounds,
  setOverlayComponent,
  setOrgUnit,
} from '../actions';
import { DISASTER } from '../containers/OverlayDiv/constants';
import { formatDateForApi } from '../utils';
import { selectCurrentOrgUnit } from '../selectors';

// As a module that requires extra data for its dashboard item data fetches, the 'disaster' sagas
// file must export this generator function to allow the global fetchDashboardItemData saga to
// call it and wait for it to finish during the fetch of 'disaster' project dashboard elements
export function* getDisasterDateRange() {
  let state = yield select();
  if (!state.disaster.disasters) {
    yield take(SET_DISASTERS_DATA); // If disaster state is not yet initialised, wait until it is
    state = yield select(); // Refetch state to get updated disaster info after initialisation
  }
  const { disasters, selectedDisaster } = state.disaster;
  if (!selectedDisaster) {
    // User can still see disaster dashboard without selecting disaster,
    // set most current active disaster as selectedDisaster and show user dialog
    const currentOrganisationUnit = selectCurrentOrgUnit(state);

    const mostCurrentDisaster =
      Object.values(disasters)
        .sort((a, b) => a.startDate - b.startDate)
        .find(disaster => disaster.countryCode === currentOrganisationUnit.countryCode) || {};

    yield put(selectDisaster(mostCurrentDisaster));
    state = yield select();
  }

  const { selectedDisaster: disaster } = state.disaster;
  return {
    disasterStartDate: formatDateForApi(disaster.startDate),
    disasterEndDate: formatDateForApi(disaster.endDate),
  };
}

function* fetchDisasters() {
  try {
    const { disasters } = yield call(request, 'disasters', fetchDisastersError);
    const data = disasters.reduce(
      (state, d) => ({
        ...state,
        [d.id]: d,
      }),
      {},
    );

    yield put(setDisastersData(data));
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

function* watchFetchInitialDataAndFetchDisasters() {
  yield takeLatest(FETCH_INITIAL_DATA, fetchDisasters);
}

function* watchViewDisasterAndZoomToBounds() {
  yield takeLatest(VIEW_DISASTER, function* (action) {
    const { disaster } = action;
    const { bounds } = disaster;

    if (bounds.length > 0) {
      yield put(changeBounds(bounds));
      yield put(setOrgUnit(disaster.countryCode, false));
    } else {
      yield put(setOrgUnit(disaster.countryCode, true));
    }
  });
}

function* watchSelectDisasterAndOpenOverlay() {
  yield takeLatest(SELECT_DISASTER, function* () {
    yield put(setOverlayComponent(DISASTER));
  });
}

export default [
  watchFetchInitialDataAndFetchDisasters,
  watchViewDisasterAndZoomToBounds,
  watchSelectDisasterAndOpenOverlay,
];
