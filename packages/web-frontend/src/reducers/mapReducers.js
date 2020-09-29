/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux';

import {
  SET_MEASURE,
  SET_ORG_UNIT,
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
  CLEAR_MEASURE,
  UPDATE_MEASURE_CONFIG,
} from '../actions';

import { MARKER_TYPES } from '../constants';
import { DEFAULT_BOUNDS } from '../defaults';
import { mapBoxToken } from '../utils';

function position(state = { bounds: DEFAULT_BOUNDS }, action) {
  switch (action.type) {
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

function measureInfo(state = {}, action) {
  switch (action.type) {
    case CLEAR_MEASURE:
      return {};
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
        //Combine default hiddenMeasures (action.response.hiddenMeasures) and hiddenMeasures in the state so that default hiddenMeasures are populated
        //If hiddenMeasures in the state has the same value, override the default hiddenMeasures.
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
    case SET_MEASURE:
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

    // Changing of Zoom happens using secondary interactions on a button and
    // therefore overrides the users current map behavior.
    case CHANGE_ZOOM:
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
    default:
      return state || getAutoTileset();
  }
}

// MAPBOX STYLES
const GERRY_ACCESS_KEY =
  'pk.eyJ1IjoiZ2VkY2tlbGx5IiwiYSI6ImNrY3BsZ2RwYTB3N20yc3FyaTZlNzhzNDUifQ.N61FIOcE-3RTksi9Tlm5ow#10.25/17.9782/102.6277';
const GERRY_USERNAME = 'gedckelly';

const makeStyleUrl = ({ styleId, accessKey = GERRY_ACCESS_KEY, username = GERRY_USERNAME }) =>
  `https://api.mapbox.com/styles/v1/${username}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${accessKey}`;

const dummyState = [
  {
    key: 'osm',
    label: 'Open Streets',
    thumbnail: '/images/osm.png',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  {
    key: 'satellite',
    label: 'Satellite',
    thumbnail: '/images/satellite.png',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${mapBoxToken}`,
  },
  {
    key: 'waterways',
    label: 'Waterways',
    thumbnail: '/images/waterways.png',
    url: makeStyleUrl({ styleId: 'ckemdct811px619qklzgvvg53' }),
  },
  {
    key: 'roads',
    label: 'Roads',
    thumbnail: '/images/roads.png',
    url: makeStyleUrl({ styleId: 'ckenp4uq10dfq1anzert7iot7' }),
    legendItems: [
      {
        color: '#D13333',
        label: 'Ethnic group one',
      },
      {
        color: '#E37F49',
        label: 'Ethnic group two',
      },
      {
        color: '#E12EC5',
        label: 'Ethnic group three',
      },
      {
        color: '#22D489',
        label: 'Ethnic group four',
      },
      {
        color: '#2196F3',
        label: 'Ethnic group five',
      },
    ],
  },
  {
    key: 'terrain',
    label: 'Terrain',
    thumbnail: '/images/terrain.png',
    url: makeStyleUrl({ styleId: 'ckenu2thw0ibl1anzk5aarzu6' }),
  },
  // {
  //   key: 'waterways',
  //   label: 'Waterways',
  //   thumbnail: '/images/waterways.png',
  //   url: makeStyleUrl({ styleId: 'ckemdct811px619qklzgvvg53' }),
  // },
  // {
  //   key: 'roads',
  //   label: 'Roads',
  //   thumbnail: '/images/roads.png',
  //   url: makeStyleUrl({ styleId: 'ckenp4uq10dfq1anzert7iot7' }),
  // },
  // {
  //   key: 'terrain',
  //   label: 'Terrain',
  //   thumbnail: '/images/terrain.png',
  //   url: makeStyleUrl({ styleId: 'ckenu2thw0ibl1anzk5aarzu6' }),
  // },
];

function tileSets(state = dummyState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default combineReducers({
  position,
  measureInfo,
  activeTileSetKey,
  tileSets,
  isAnimating,
  popup,
  shouldSnapToPosition,
  isMeasureLoading,
});
