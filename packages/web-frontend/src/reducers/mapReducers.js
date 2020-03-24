/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { cachedSelectOrgUnitAndDescendants } from './orgUnitReducers';

import {
  GO_HOME,
  CHANGE_MEASURE,
  CHANGE_ORG_UNIT,
  CHANGE_POSITION,
  CHANGE_BOUNDS,
  CHANGE_TILE_SET,
  CHANGE_ZOOM,
  FETCH_MEASURE_DATA_ERROR,
  FETCH_MEASURE_DATA_SUCCESS,
  CANCEL_FETCH_MEASURE_DATA,
  CHANGE_ORG_UNIT_SUCCESS,
  SET_MAP_IS_ANIMATING,
  OPEN_MAP_POPUP,
  CLOSE_MAP_POPUP,
  HIDE_MAP_MEASURE,
  UNHIDE_MAP_MEASURE,
  ADD_MAP_REGIONS,
} from '../actions';
import { getMeasureFromHierarchy } from '../utils/getMeasureFromHierarchy';
import { MARKER_TYPES } from '../containers/Map/MarkerLayer';
import {
  getMeasureDisplayInfo,
  calculateRadiusScaleFactor,
  MEASURE_TYPE_SHADING,
} from '../utils/measures';

import { initialOrgUnit } from '../defaults';

const defaultBounds = initialOrgUnit.location.bounds;

function position(state = { bounds: defaultBounds }, action) {
  switch (action.type) {
    case GO_HOME: {
      return { bounds: defaultBounds };
    }

    case CHANGE_ORG_UNIT:
    case CHANGE_ORG_UNIT_SUCCESS: {
      if (action.shouldChangeMapBounds) {
        const { location } = action.organisationUnit;
        if (location) {
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

    case CHANGE_ZOOM: {
      const newZoom = state.zoom + action.value;
      if (newZoom < 1 || newZoom > 18) return state;
      return { ...state, zoom: newZoom };
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

function innerAreas(state = [], action) {
  switch (action.type) {
    case CHANGE_ORG_UNIT: {
      return [];
    }
    case CHANGE_ORG_UNIT_SUCCESS: {
      const { organisationUnit } = action;
      const { organisationUnitChildren } = organisationUnit;
      if (organisationUnitChildren && organisationUnitChildren.length > 0) {
        return organisationUnitChildren;
      }
      return state;
    }
    default: {
      return state;
    }
  }
}

function measureInfo(state = {}, action) {
  switch (action.type) {
    case CHANGE_ORG_UNIT:
      if (action.organisationUnit.organisationUnitCode === 'World') {
        // clear measures when returning to world view
        return {};
      }
      return state;
    case CHANGE_MEASURE:
      return state;
    case FETCH_MEASURE_DATA_SUCCESS: {
      const currentCountry = action.countryCode;
      // remove measure units with no coordinates
      let measureData = action.response.measureData;
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
        hiddenMeasures: {
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
    case CHANGE_MEASURE:
      return true;
    case FETCH_MEASURE_DATA_ERROR:
    case FETCH_MEASURE_DATA_SUCCESS:
    case CANCEL_FETCH_MEASURE_DATA:
      return false;
    default:
      return state;
  }
}

function focussedOrganisationUnit(state = {}, action) {
  switch (action.type) {
    case CHANGE_ORG_UNIT:
      return action.organisationUnit;

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

    // Changing of Zoom happens using secondary interactions on a button and
    // therefore overrides the users current map behavior.
    case CHANGE_ZOOM:
    case CHANGE_BOUNDS:
      return true;

    case CHANGE_ORG_UNIT:
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
  const SLOW_LOAD_TIME_THRESHOLD = 2 * 1000; // 2 seconds in milliseconds
  return window.loadTime < SLOW_LOAD_TIME_THRESHOLD ? 'satellite' : 'osm';
}

/**
 * Which tileset to use for the map.
 */
function tileSet(state, action) {
  switch (action.type) {
    case CHANGE_TILE_SET:
      return action.setKey;
    default:
      return state || getAutoTileset();
  }
}

function regions(state = {}, action) {
  switch (action.type) {
    case ADD_MAP_REGIONS:
      return {
        ...state,
        ...action.regionData,
      };
    default:
      return state;
  }
}

export default combineReducers({
  position,
  innerAreas,
  measureInfo,
  tileSet,
  focussedOrganisationUnit,
  isAnimating,
  popup,
  shouldSnapToPosition,
  isMeasureLoading,
  regions,
});

// Public selectors

export function selectMeasureName(state = {}) {
  const { measureHierarchy, selectedMeasureId } = state.measureBar;
  const selectedMeasure = getMeasureFromHierarchy(measureHierarchy, selectedMeasureId);
  return selectedMeasure ? selectedMeasure.name : '';
}

export const selectHasPolygonMeasure = createSelector(
  [state => state.map.measureInfo],
  (stateMeasureInfo = {}) => {
    return (
      stateMeasureInfo.measureOptions &&
      stateMeasureInfo.measureOptions.some(option => option.type === MEASURE_TYPE_SHADING)
    );
  },
);

const selectMeasureDataByCode = createSelector(
  [state => state.map.measureInfo.measureData, (_, code) => code],
  (data = [], code) => data.find(val => val.organisationUnitCode === code),
);

const cachedSelectMeasureWithDisplayInfo = createCachedSelector(
  [
    (_, organisationUnitCode) => organisationUnitCode,
    selectMeasureDataByCode,
    state => state.map.measureInfo.measureOptions,
    state => state.map.measureInfo.hiddenMeasures,
  ],
  (organisationUnitCode, data, options = [], hiddenMeasures) => {
    return {
      organisationUnitCode,
      ...data,
      ...getMeasureDisplayInfo({ ...data }, options, hiddenMeasures),
    };
  },
)((_, orgUnitCode) => orgUnitCode);

export const selectAllMeasuresWithDisplayInfo = createSelector(
  [state => state, state => state.map.measureInfo],
  (state, measureInfoParam) => {
    const { measureData, currentCountry, measureLevel } = measureInfoParam;
    if (!measureLevel || !currentCountry || !measureData) {
      return [];
    }

    const listOfMeasureLevels = measureLevel.split(',');
    const allOrgUnits = cachedSelectOrgUnitAndDescendants(state, currentCountry).filter(orgUnit =>
      listOfMeasureLevels.includes(orgUnit.type),
    );

    return allOrgUnits.map(orgUnit =>
      cachedSelectMeasureWithDisplayInfo(state, orgUnit.organisationUnitCode),
    );
  },
);

export const selectRadiusScaleFactor = createSelector(
  [selectAllMeasuresWithDisplayInfo],
  calculateRadiusScaleFactor,
);
