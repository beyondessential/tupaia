/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux';

import {
  SET_MAP_OVERLAY,
  SET_ORG_UNIT,
  CHANGE_POSITION,
  CHANGE_BOUNDS,
  CHANGE_TILE_SET,
  FETCH_MEASURE_DATA_ERROR,
  FETCH_MEASURE_DATA_SUCCESS,
  CANCEL_FETCH_MEASURE_DATA,
  CHANGE_ORG_UNIT_SUCCESS,
  SET_MAP_IS_ANIMATING,
  OPEN_MAP_POPUP,
  CLOSE_MAP_POPUP,
  HIDE_MAP_MEASURE,
  UNHIDE_MAP_MEASURE,
  CLEAR_MEASURE,
  UPDATE_MEASURE_CONFIG,
  SET_PROJECT,
} from '../actions';

import { MARKER_TYPES } from '../constants';
import { DEFAULT_BOUNDS } from '../defaults';

function position(state = { bounds: DEFAULT_BOUNDS }, action) {
  switch (action.type) {
    case CHANGE_ORG_UNIT_SUCCESS: {
      if (action.shouldChangeMapBounds) {
        const { location, organisationUnitCode } = action.organisationUnit;

        if (location) {
          if (organisationUnitCode === 'explore' || organisationUnitCode === 'disaster') {
            return {
              bounds: DEFAULT_BOUNDS,
            };
          }

          if (location.bounds) {
            return {
              bounds: location.bounds,
            };
          }
          if (location.type === 'point') {
            return {
              center: location.coordinates,
              zoom: 10,
            };
          }
        }
      }
      return state;
    }

    case CHANGE_POSITION: {
      return { center: action.center, zoom: action.zoom };
    }

    case CHANGE_BOUNDS: {
      return { bounds: action.bounds };
    }

    default: {
      return state;
    }
  }
}

function measureInfo(state = {}, action) {
  switch (action.type) {
    case CLEAR_MEASURE:
      return {};
    case FETCH_MEASURE_DATA_SUCCESS: {
      const currentCountry = action.countryCode;
      // remove measure units with no coordinates
      let { measureData } = action.response;
      // for circle heatmap remove empty values or values that are not of positive float type
      if (action.response.displayType === MARKER_TYPES.CIRCLE_HEATMAP) {
        measureData = measureData.filter(({ value }) => {
          if (!value || value === '') return false;
          const parsedValue = parseFloat(value);
          return !Number.isNaN(parsedValue) && parsedValue >= 0;
        });
      }

      return {
        ...action.response,
        // Combine default hiddenMeasures (action.response.hiddenMeasures) and hiddenMeasures in the state so that default hiddenMeasures are populated
        // If hiddenMeasures in the state has the same value, override the default hiddenMeasures.
        hiddenMeasures: {
          ...action.response.hiddenMeasures,
          ...state.hiddenMeasures,
        },
        currentCountry,
        measureData,
      };
    }
    case FETCH_MEASURE_DATA_ERROR:
      return action.error;
    case HIDE_MAP_MEASURE:
      return {
        ...state,
        hiddenMeasures: {
          ...state.hiddenMeasures,
          [action.key]: { ...state.hiddenMeasures[action.key], [action.value]: true },
        },
      };
    case UNHIDE_MAP_MEASURE:
      return {
        ...state,
        hiddenMeasures: {
          ...state.hiddenMeasures,
          [action.key]: { ...state.hiddenMeasures[action.key], [action.value]: false },
        },
      };
    default:
      return state;
  }
}

function isMeasureLoading(state = false, action) {
  switch (action.type) {
    case UPDATE_MEASURE_CONFIG:
    case SET_MAP_OVERLAY:
      return true;
    case FETCH_MEASURE_DATA_ERROR:
    case FETCH_MEASURE_DATA_SUCCESS:
    case CANCEL_FETCH_MEASURE_DATA:
      return false;
    default:
      return state;
  }
}

function popup(state = null, action) {
  switch (action.type) {
    case OPEN_MAP_POPUP:
      return action.orgUnitCode;

    case CLOSE_MAP_POPUP:
      return state === action.orgUnitCode ? null : state;

    default:
      return state;
  }
}

function isAnimating(state = false, action) {
  switch (action.type) {
    case SET_MAP_IS_ANIMATING:
      return action.isAnimating;

    default:
      return state;
  }
}

/**
 * Whether the current map position has been altered by the user.
 *
 * Reset when forcing position changes such as through history updates.
 */
function shouldSnapToPosition(state = true, action) {
  switch (action.type) {
    case CHANGE_POSITION:
      return false;
    case CHANGE_BOUNDS:
      return true;
    case SET_ORG_UNIT:
    case CHANGE_ORG_UNIT_SUCCESS:
      return action.shouldChangeMapBounds ? true : state;
    default:
      return state;
  }
}

/**
 * Utility function to determine whether tileSet should default to satellite
 * or to osm, based on page load time. This will only run when determining the
 * initial state of the map.
 */
function getAutoTileset() {
  // default to osm in dev so that we don't pay for tiles when running locally
  if (process.env.NODE_ENV !== 'production') {
    return 'osm';
  }
  const SLOW_LOAD_TIME_THRESHOLD = 2 * 1000; // 2 seconds in milliseconds
  return window.loadTime < SLOW_LOAD_TIME_THRESHOLD ? 'satellite' : 'osm';
}

/**
 * Which tileset to use for the map.
 */
function activeTileSetKey(state, action) {
  switch (action.type) {
    case CHANGE_TILE_SET:
      return action.setKey;
    case SET_PROJECT:
      return getAutoTileset();
    default:
      return state || getAutoTileset();
  }
}

export default combineReducers({
  position,
  measureInfo,
  activeTileSetKey,
  isAnimating,
  popup,
  shouldSnapToPosition,
  isMeasureLoading,
});
