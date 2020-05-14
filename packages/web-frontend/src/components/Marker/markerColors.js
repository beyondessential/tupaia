/* eslint-disable no-restricted-globals */
/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import moment from 'moment';
import { BREWER_PALETTE, MAP_COLORS } from '../../styles';
import { SCALE_TYPES } from '../../constants';

const HEATMAP_UNKNOWN_COLOR = MAP_COLORS.NO_DATA;
const DEFAULT_COLOR_SCHEME = 'default';
const PERFORMANCE_COLOR_SCHEME = 'performance';
const TIME_COLOR_SCHEME = 'time';

const COLOR_SCHEME_TO_FUNCTION = {
  [DEFAULT_COLOR_SCHEME]: getHeatmapColor,
  [PERFORMANCE_COLOR_SCHEME]: getPerformanceHeatmapColor,
  [TIME_COLOR_SCHEME]: getTimeHeatmapColor,
};

const SCALE_TYPE_TO_COLOR_SCHEME = {
  [SCALE_TYPES.PERFORMANCE]: PERFORMANCE_COLOR_SCHEME,
  [SCALE_TYPES.PERFORMANCE_DESC]: PERFORMANCE_COLOR_SCHEME,
  [SCALE_TYPES.POPULATION]: DEFAULT_COLOR_SCHEME,
  [SCALE_TYPES.TIME]: TIME_COLOR_SCHEME,
};

/**
 * Helper function just to point the spectrum type to the correct colours
 *
 * @param {constant} scaleType one of the SCALE_TYPE* constants
 * @param {number | string} value a number in range [0..1] representing percentage or
 *                 a string of a date within a range specified by [min, max]
 * @param {number | string} min the lowest number or a string representing earliest date in a range
 * @param {number | string} max the highest number or a string representing lastest date in a range
 * @param {string} noDataColour css hsl string, e.g. `hsl(value, 100%, 50%)` for null value
 * @returns {style} css hsl string, e.g. `hsl(value, 100%, 50%)`
 */
export function resolveSpectrumColour(scaleType, scaleColorScheme, value, min, max, noDataColour) {
  if (value === null || (isNaN(value) && scaleType !== SCALE_TYPES.TIME))
    return noDataColour || HEATMAP_UNKNOWN_COLOR;

  const valueToColor =
    COLOR_SCHEME_TO_FUNCTION[scaleColorScheme] ||
    COLOR_SCHEME_TO_FUNCTION[SCALE_TYPE_TO_COLOR_SCHEME[scaleType]] ||
    COLOR_SCHEME_TO_FUNCTION[DEFAULT_COLOR_SCHEME];

  switch (scaleType) {
    default:
      return valueToColor(value && normaliseToPercentage(value, min, max));
    case SCALE_TYPES.PERFORMANCE:
      return valueToColor(value);
    case SCALE_TYPES.PERFORMANCE_DESC: {
      const percentage = value || value === 0 ? 1 - normaliseToPercentage(value, min, max) : null;
      return valueToColor(percentage);
    }
    case SCALE_TYPES.TIME:
      // if the value passed is a date locate it in the [min, max] range
      if (isNaN(value)) return valueToColor(getTimeProportion(value, min, max), noDataColour);
      return valueToColor(value, noDataColour);
  }
}

const normaliseToPercentage = (value, min, max) => {
  return (value - min) / (max - min);
};
/**
 * Takes a value and return a hsl color string for use as a style
 *
 * @param {number} value Number in range [0..1] representing percentage
 * @returns {style} css hsl string, e.g. `hsl(value, 100%, 50%)`
 */
export function getPerformanceHeatmapColor(value) {
  return `hsl(${Math.floor(value * 100)}, 100%, 50%)`;
}

const getTimeProportion = (value, min, max) => {
  if (!value || !isNaN(value)) return null;
  const range = moment(max).diff(min, 'days');
  const valueAsMoment = moment(value);
  const ageOfSample = moment(max).diff(valueAsMoment, 'days');
  return ageOfSample / range;
};

/**
 * Takes a value and return a hsl color string for use as a style
 *
 * @param {number} value Number in range [0..1] representing percentage
 * @returns {style} css hsl string, e.g. `hsl(value, 100%, 50%)`
 */
export function getTimeHeatmapColor(value, noDataColour) {
  if (value === null || isNaN(value)) return noDataColour || HEATMAP_UNKNOWN_COLOR;
  return `hsl(${100 - Math.floor(value * 100)}, 100%, 50%)`;
}

/**
 * Takes a value and returns color string for use as a style
 * to match the map/legend style shown here:
 * https://commons.wikimedia.org/wiki/File:South_Africa_2011_population_density_map.svg
 *
 * @param {number} value A value in the range [0..1] representing a percentage
 * @returns {style} css rgb string, e.g. `rgb(0,0,0)`
 */
export function getHeatmapColor(value) {
  let rgb = [0, 0, 0];

  if (value < 0.15) rgb = [255, 255, 204];
  else if (value >= 0.15 && value < 0.25) rgb = [255, 237, 160];
  else if (value >= 0.25 && value < 0.35) rgb = [254, 217, 118];
  else if (value >= 0.35 && value < 0.45) rgb = [254, 178, 76];
  else if (value >= 0.45 && value < 0.55) rgb = [253, 141, 60];
  else if (value >= 0.55 && value < 0.65) rgb = [252, 78, 42];
  else if (value >= 0.65 && value < 0.75) rgb = [227, 26, 28];
  else if (value >= 0.75 && value < 0.85) rgb = [118, 0, 38];
  else if (value >= 0.85) rgb = [128, 0, 38];

  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

export const BREWER_AUTO = [
  BREWER_PALETTE.navy,
  BREWER_PALETTE.orange,
  BREWER_PALETTE.magenta,
  BREWER_PALETTE.blue,
  BREWER_PALETTE.teal,
  BREWER_PALETTE.custard,
  BREWER_PALETTE.cyan,
  BREWER_PALETTE.yellow,
  BREWER_PALETTE.purple,
];

export const YES_COLOR = BREWER_PALETTE.green;
export const NO_COLOR = BREWER_PALETTE.red;
export const UNKNOWN_COLOR = 'grey';

export const DEFAULT_DISASTER_COLOR = 'orange';

// Use a palette color if named, otherwise just return the name.
// This allows measures to still use hex codes and named colors not in the palette.
export function getColor(colorName) {
  return BREWER_PALETTE[colorName] || colorName;
}
