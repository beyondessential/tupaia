/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * History middleware. This specifies the interface between the site and the url
 */

import moment from 'moment';
import {
  CLEAR_MEASURE,
  CLOSE_ENLARGED_DIALOG,
  GO_HOME,
  OPEN_ENLARGED_DIALOG,
  SET_DASHBOARD_GROUP,
  SET_ENLARGED_DIALOG_DATE_RANGE,
  SET_MAP_OVERLAYS,
  SET_MOBILE_TAB,
  SET_ORG_UNIT,
  SET_PROJECT,
  updateHistoryLocation,
  UPDATE_OVERLAY_CONFIGS,
  LOCATION_CHANGE,
} from '../actions';
import {
  selectCurrentMapOverlayCodes,
  selectCurrentMapOverlayPeriods,
  selectPeriodGranularityByCode,
  selectMapOverlayByCodes,
} from '../selectors';
import { DEFAULT_PERIOD, URL_COMPONENTS } from './constants';
import {
  addPopStateListener,
  attemptPushHistory,
  clearLocation,
  setLocationComponents,
} from './historyNavigation';
import { convertDateRangeToUrlPeriodString } from './utils';

export const historyMiddleware = store => next => action => {
  if (action.meta && action.meta.preventHistoryUpdate) return next(action);

  const state = store.getState();
  switch (action.type) {
    // Actions that modify the path
    case SET_PROJECT:
      dispatchLocationUpdate(store, { [URL_COMPONENTS.PROJECT]: action.projectCode });
      break;
    case SET_ORG_UNIT:
      dispatchLocationUpdate(store, { [URL_COMPONENTS.ORG_UNIT]: action.organisationUnitCode });
      dispatchLocationUpdate(store, { [URL_COMPONENTS.DASHBOARD]: '' });
      break;
    case SET_DASHBOARD_GROUP:
      dispatchLocationUpdate(store, {
        [URL_COMPONENTS.DASHBOARD]: encodeURIComponent(action.name),
      });
      break;
    case GO_HOME:
      // Completely clear location, explore project will be set in a saga.
      dispatchClearLocation(store);
      break;

    // Actions that modify search params
    case OPEN_ENLARGED_DIALOG:
      dispatchLocationUpdate(store, { [URL_COMPONENTS.REPORT]: action.itemCode });
      break;
    case SET_ENLARGED_DIALOG_DATE_RANGE:
      // Drill down dates are handled in normal redux state
      if (action.drillDownLevel === 0) {
        dispatchLocationUpdate(store, {
          [URL_COMPONENTS.REPORT_PERIOD]: convertDateRangeToUrlPeriodString({
            startDate: moment(action.startDate),
            endDate: moment(action.endDate),
          }),
        });
      }
      break;
    case CLOSE_ENLARGED_DIALOG:
      dispatchLocationUpdate(store, { [URL_COMPONENTS.REPORT]: null });
      dispatchLocationUpdate(store, { [URL_COMPONENTS.REPORT_PERIOD]: null });
      break;
    case SET_MAP_OVERLAYS: {
      const currentMapOverlayCodes = action.mapOverlayCodes.split(',');
      const mapOverlays = selectMapOverlayByCodes(state, currentMapOverlayCodes);
      if (mapOverlays.length === 0) {
        break;
      }
      const currentOverlayPeriods = [];
      currentMapOverlayCodes.forEach(mapOverlayCode => {
        const { startDate, endDate, periodGranularity } =
          mapOverlays.find(mapOverlay => mapOverlay.mapOverlayCode === mapOverlayCode) || {};
        const overlayPeriod = convertDateRangeToUrlPeriodString(
          { startDate, endDate },
          periodGranularity,
        );
        currentOverlayPeriods.push(overlayPeriod || DEFAULT_PERIOD);
      });

      dispatchLocationUpdate(store, {
        [URL_COMPONENTS.MAP_OVERLAY]: action.mapOverlayCodes,
        [URL_COMPONENTS.OVERLAY_PERIOD]: currentOverlayPeriods.join(','),
      });
      break;
    }
    case CLEAR_MEASURE:
      dispatchLocationUpdate(store, {
        [URL_COMPONENTS.MAP_OVERLAY]: null,
        [URL_COMPONENTS.OVERLAY_PERIOD]: null,
      });
      break;
    case UPDATE_OVERLAY_CONFIGS: {
      const currentOverlayCodes = selectCurrentMapOverlayCodes(state);
      const currentOverlayPeriods = selectCurrentMapOverlayPeriods(state);

      Object.entries(action.overlayConfigs).forEach(([mapOverlayCode, overlayConfig]) => {
        const targetedOverlayIndex = currentOverlayCodes.findIndex(code => code === mapOverlayCode);
        const newOverlayPeriod = convertDateRangeToUrlPeriodString(
          overlayConfig,
          selectPeriodGranularityByCode(state, mapOverlayCode),
        );
        currentOverlayPeriods[targetedOverlayIndex] = newOverlayPeriod || DEFAULT_PERIOD;
      });

      dispatchLocationUpdate(store, {
        [URL_COMPONENTS.OVERLAY_PERIOD]: currentOverlayPeriods.join(','),
      });
      break;
    }
    case SET_MOBILE_TAB: {
      dispatchLocationUpdate(store, {
        [URL_COMPONENTS.MOBILE_TAB]: action.tab,
      });
      break;
    }
    default:
  }

  return next(action);
};

// This function and the corresponding architecture are from this blog post:
// https://read.reduxbook.com/markdown/part2/09-routing.html
export const initHistoryDispatcher = store => {
  // Update Redux if we navigated via browser's back/forward
  addPopStateListener(location => {
    const previousLocation = store.getState().routing;
    store.dispatch(updateHistoryLocation(location));
    store.dispatch({ type: LOCATION_CHANGE, location, previousLocation });
  });

  // The other part of the two-way binding is updating the displayed
  // URL in the browser if we change it inside our app state in Redux.
  // We can simply subscribe to Redux and update it if it's different.
  store.subscribe(() => {
    const location = store.getState().routing;
    attemptPushHistory(location);
  });
};

const dispatchLocationUpdate = (store, newComponents) => {
  const { dispatch } = store;
  const { routing } = store.getState();

  const newLocation = setLocationComponents(routing, newComponents);
  dispatch(updateHistoryLocation(newLocation));
};

const dispatchClearLocation = store => {
  const { dispatch } = store;
  dispatch(updateHistoryLocation(clearLocation()));
};
