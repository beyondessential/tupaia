/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import moment from 'moment';
import { blue, red, green } from '@material-ui/core/colors';
import {
  BREWER_PALETTE,
  SCALE_TYPES,
  HEATMAP_UNKNOWN_COLOR,
  DEFAULT_COLOR_SCHEME,
  REVERSE_DEFAULT_COLOR_SCHEME,
  PERFORMANCE_COLOR_SCHEME,
  TIME_COLOR_SCHEME,
  GPI_COLOR_SCHEME,
} from '../constants';

export const DEFAULT_DISASTER_COLOR = 'orange';

const COLOR_SCHEME_TO_FUNCTION = {
  [DEFAULT_COLOR_SCHEME]: getHeatmapColor,
  [REVERSE_DEFAULT_COLOR_SCHEME]: getReverseHeatmapColor,
  [PERFORMANCE_COLOR_SCHEME]: getPerformanceHeatmapColor,
  [TIME_COLOR_SCHEME]: getTimeHeatmapColor,
  [GPI_COLOR_SCHEME]: getGPIColor,
};

const SCALE_TYPE_TO_COLOR_SCHEME = {
  [SCALE_TYPES.PERFORMANCE]: PERFORMANCE_COLOR_SCHEME,
  [SCALE_TYPES.PERFORMANCE_DESC]: PERFORMANCE_COLOR_SCHEME,
  [SCALE_TYPES.NEUTRAL]: DEFAULT_COLOR_SCHEME,
  [SCALE_TYPES.NEUTRAL_REVERSE]: REVERSE_DEFAULT_COLOR_SCHEME,
  [SCALE_TYPES.TIME]: TIME_COLOR_SCHEME,
  [SCALE_TYPES.GPI]: GPI_COLOR_SCHEME,
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
    case SCALE_TYPES.PERFORMANCE_DESC: {
      const percentage = value || value === 0 ? 1 - normaliseToPercentage(value, min, max) : null;
      return valueToColor(percentage);
    }
    case SCALE_TYPES.TIME:
      // if the value passed is a date locate it in the [min, max] range
      if (isNaN(value)) return valueToColor(getTimeProportion(value, min, max), noDataColour);
      return valueToColor(value, noDataColour);

    case SCALE_TYPES.GPI:
      return valueToColor(value, min, max);
    case SCALE_TYPES.PERFORMANCE:
    case SCALE_TYPES.NEUTRAL:
    case SCALE_TYPES.NEUTRAL_REVERSE:
    default:
      return valueToColor((value || value === 0) && normaliseToPercentage(value, min, max));
  }
}

const normaliseToPercentage = (value, min = 0, max = 1) => {
  // Always clamp the result between 0 and 1
  if (value < min) return 0;
  if (value > max) return 1;
  if (min === max) return 0.5;

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

const HEATMAP_DEFAULT_RGB_SET = [
  'rgb(255, 255, 204)',
  'rgb(255, 237, 160)',
  'rgb(254, 217, 118)',
  'rgb(254, 178, 76)',
  'rgb(253, 141, 60)',
  'rgb(252, 78, 42)',
  'rgb(227, 26, 28)',
  'rgb(118, 0, 38)',
  'rgb(128, 0, 38)',
];

/**
 * Takes a value and returns color string for use as a style
 * to match the map/legend style shown here:
 * https://commons.wikimedia.org/wiki/File:South_Africa_2011_population_density_map.svg
 *
 * @param {number} value A value in the range [0..1] representing a percentage
 * @param {default} if default is true, return lightest to darkest colour, otherwise return darkest to lightest
 * @returns {style} css rgb string, e.g. `rgb(0,0,0)`
 */
function getHeatmapColorByOrder({ value, swapColor = false, colorSet = HEATMAP_DEFAULT_RGB_SET }) {
  const difference = value - 0.15;
  const index = difference < 0 ? 0 : Math.floor(difference / 0.1) + 1;
  const indexInRange = index > colorSet.length - 1 ? colorSet.length - 1 : index;
  return !swapColor ? colorSet[indexInRange] : colorSet[colorSet.length - indexInRange - 1];
}

export function getHeatmapColor(value) {
  return getHeatmapColorByOrder({ value, swapColor: false });
}

export function getReverseHeatmapColor(value) {
  return getHeatmapColorByOrder({ value, swapColor: true });
}

// Use a palette color if named, otherwise just return the name.
// This allows measures to still use hex codes and named colors not in the palette.
export function getColor(colorName) {
  return BREWER_PALETTE[colorName] || colorName;
}

/**
 * GPI Colors
 */
const BLUE_COLOR_SET = [
  blue['900'],
  blue['900'],
  blue['800'],
  blue['800'],
  blue['700'],
  blue['600'],
  blue['500'],
  blue['400'],
  blue['300'],
];

const RED_COLOR_SET = [
  red['300'],
  red['400'],
  red['500'],
  red['600'],
  red['700'],
  red['800'],
  red['800'],
  red['900'],
  red['900'],
];

/**
 *
 *  A GPI between 0.97 - 1.03 is considered gender parity
 */
const GPI_PARITY_UPPER_LIMIT = '1.03';
const GPI_PARITY_LOWER_LIMIT = '0.97';

/**
 *
 * @param value - GPI value type is number between 0 and 2.
 * @returns {string}
 */
export function getGPIColor(value, min, max) {
  if (value > GPI_PARITY_UPPER_LIMIT) {
    const normalisedValue = normaliseToPercentage(Math.min(value, 2), GPI_PARITY_UPPER_LIMIT, max);
    return getHeatmapColorByOrder({ value: normalisedValue, colorSet: RED_COLOR_SET });
  }

  if (value < GPI_PARITY_LOWER_LIMIT) {
    const normalisedValue = normaliseToPercentage(value, min, GPI_PARITY_LOWER_LIMIT);
    return getHeatmapColorByOrder({ value: normalisedValue, colorSet: BLUE_COLOR_SET });
  }

  return green['500'];
}
