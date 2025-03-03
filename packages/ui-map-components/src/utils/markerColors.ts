import moment from 'moment';
import { blue, red, green } from '@material-ui/core/colors';
import { ScaleType, MeasureColorScheme } from '@tupaia/types';
import { BREWER_PALETTE, HEATMAP_UNKNOWN_COLOR } from '../constants';
import { Color, ColorKey } from '../types';

const COLOR_SCHEME_TO_FUNCTION = {
  [MeasureColorScheme.DEFAULT]: getHeatmapColor,
  [MeasureColorScheme.REVERSE_DEFAULT]: getReverseHeatmapColor,
  [MeasureColorScheme.PERFORMANCE]: getPerformanceHeatmapColor,
  [MeasureColorScheme.GPI]: getGPIColor,
};

const SCALE_TYPE_TO_COLOR_SCHEME = {
  [ScaleType.PERFORMANCE]: MeasureColorScheme.PERFORMANCE,
  [ScaleType.PERFORMANCE_DESC]: MeasureColorScheme.PERFORMANCE,
  [ScaleType.NEUTRAL]: MeasureColorScheme.DEFAULT,
  [ScaleType.NEUTRAL_REVERSE]: MeasureColorScheme.REVERSE_DEFAULT,
  [ScaleType.GPI]: MeasureColorScheme.GPI,
};

export type ColorScheme = keyof typeof COLOR_SCHEME_TO_FUNCTION;

/**
 * Helper function just to point the spectrum type to the correct colours
 *
 */
export function resolveSpectrumColour(
  scaleType: `${ScaleType}`,
  scaleColorScheme: ColorScheme | undefined,
  value: number | null, // a number in range [0..1] representing percentage or a string of a date within a range specified by [min, max]
  min: number | string, // the lowest number or a string representing earliest date in a range
  max: number | string, // the highest number or a string representing latest date in a range
  noDataColour?: string, // css hsl string, e.g. `hsl(value, 100%, 50%)` for null value
): string {
  if (value === null || Number.isNaN(value)) return noDataColour || HEATMAP_UNKNOWN_COLOR;

  let valueToColor: (value: number | null, ...args: any[]) => string;
  if (scaleColorScheme) {
    valueToColor = COLOR_SCHEME_TO_FUNCTION[scaleColorScheme];
  } else if (SCALE_TYPE_TO_COLOR_SCHEME[scaleType]) {
    valueToColor = COLOR_SCHEME_TO_FUNCTION[SCALE_TYPE_TO_COLOR_SCHEME[scaleType]];
  } else {
    valueToColor = COLOR_SCHEME_TO_FUNCTION[MeasureColorScheme.DEFAULT];
  }

  switch (scaleType) {
    case ScaleType.PERFORMANCE_DESC: {
      const percentage =
        value || value === 0
          ? 1 - normaliseToPercentage(value, min as number, max as number)
          : null;
      return valueToColor(percentage as number);
    }

    case ScaleType.GPI:
      return valueToColor(value, min, max);
    case ScaleType.PERFORMANCE:
    case ScaleType.NEUTRAL:
    case ScaleType.NEUTRAL_REVERSE:
    default:
      return valueToColor(
        value || value === 0 ? normaliseToPercentage(value, min as number, max as number) : null,
      );
  }
}

const normaliseToPercentage = (value: number, min = 0, max = 1) => {
  // Always clamp the result between 0 and 1
  if (value < min) return 0;
  if (value > max) return 1;
  if (min === max) return 0.5;

  return (value - min) / (max - min);
};
/**
 * Takes a value and return a hsl color string for use as a style
 */
export function getPerformanceHeatmapColor(
  value: number | null, // Number in range [0..1] representing percentage
): string {
  if (value === null) {
    return HEATMAP_UNKNOWN_COLOR;
  }

  return `hsl(${Math.floor(value * 100)}, 100%, 50%)`;
}

const getTimeProportion = (value: number | null, min: string, max: string) => {
  if (!value || !Number.isNaN(value)) return null;
  const range = moment(max).diff(min, 'days');
  const valueAsMoment = moment(value);
  const ageOfSample = moment(max).diff(valueAsMoment, 'days');
  return ageOfSample / range;
};

/**
 * Takes a value and return a hsl color string for use as a style
 */
export function getTimeHeatmapColor(
  value: number | null, // Number in range [0..1] representing percentage
  noDataColour?: string,
): string {
  if (value === null || Number.isNaN(value)) return noDataColour || HEATMAP_UNKNOWN_COLOR;
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
 */
function getHeatmapColorByOrder({
  value,
  swapColor = false,
  colorSet = HEATMAP_DEFAULT_RGB_SET,
}: {
  value: number | null;
  swapColor?: boolean;
  colorSet?: string[];
}): string {
  if (value === null) {
    return HEATMAP_UNKNOWN_COLOR;
  }

  const difference = value - 0.15;
  const index = difference < 0 ? 0 : Math.floor(difference / 0.1) + 1;
  const indexInRange = index > colorSet.length - 1 ? colorSet.length - 1 : index;
  return !swapColor ? colorSet[indexInRange] : colorSet[colorSet.length - indexInRange - 1];
}

export function getHeatmapColor(value: number | null) {
  return getHeatmapColorByOrder({ value, swapColor: false });
}

export function getReverseHeatmapColor(value: number | null) {
  return getHeatmapColorByOrder({ value, swapColor: true });
}

// Use a palette color if named, otherwise just return the name.
// This allows measures to still use hex codes and named colors not in the palette.
export function getColor(colorName: Color) {
  return BREWER_PALETTE[colorName as ColorKey] || colorName;
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
const GPI_PARITY_UPPER_LIMIT = 1.03;
const GPI_PARITY_LOWER_LIMIT = 0.97;

/**
 *
 * @returns {string}
 */
export function getGPIColor(value: number | null, min?: number, max?: number): string {
  if (value === null) {
    return HEATMAP_UNKNOWN_COLOR;
  }

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
