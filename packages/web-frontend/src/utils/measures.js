/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  YES_COLOR,
  NO_COLOR,
  BREWER_AUTO,
  UNKNOWN_COLOR,
  UNKNOWN_ICON,
} from '@tupaia/ui-components';
import { VALUE_TYPES } from '../components/View/constants';
import { MAP_COLORS } from '../styles';
import { MARKER_TYPES, SCALE_TYPES } from '../constants';

export const MEASURE_TYPE_ICON = 'icon';
export const MEASURE_TYPE_COLOR = 'color';
export const MEASURE_TYPE_RADIUS = 'radius';
export const MEASURE_TYPE_SPECTRUM = 'spectrum';
export const MEASURE_TYPE_SHADING = 'shading';
export const MEASURE_TYPE_SHADED_SPECTRUM = 'shaded-spectrum';
export const MEASURE_TYPE_POPUP_ONLY = 'popup-only';

export const MEASURE_VALUE_OTHER = 'other';
export const MEASURE_VALUE_NULL = 'null';

export const POLYGON_MEASURE_TYPES = [MEASURE_TYPE_SHADING, MEASURE_TYPE_SHADED_SPECTRUM];
export const SPECTRUM_MEASURE_TYPES = [MEASURE_TYPE_SPECTRUM, MEASURE_TYPE_SHADED_SPECTRUM];

const SPECTRUM_SCALE_DEFAULT = { left: {}, right: {} };
const PERCENTAGE_SPECTRUM_SCALE_DEFAULT = { left: { max: 0 }, right: { min: 1 } };

function autoAssignColors(values) {
  if (!values) return [];

  let autoIndex = 0;
  const getColor = valueObject => {
    if (!valueObject.name) {
      return BREWER_AUTO[autoIndex++];
    }

    switch (valueObject.name.toLowerCase()) {
      case 'yes':
        return YES_COLOR;
      case 'no':
        return NO_COLOR;
      default:
        return BREWER_AUTO[autoIndex++];
    }
  };

  return values.map(v => ({
    ...v,
    color: v.color || getColor(v),
  }));
}

function createValueMapping(valueObjects, type) {
  const mapping = {};

  valueObjects.forEach(valueObject => {
    const { value } = valueObject;

    if (Array.isArray(value)) {
      value.forEach(v => {
        mapping[v] = valueObject;
      });
    } else {
      mapping[value] = valueObject;
    }
  });

  // add a "no data" object to the mapping if there isn't one present already
  const requiresNull = !Object.keys(mapping).some(k => k === MEASURE_VALUE_NULL);
  if (requiresNull) {
    mapping[MEASURE_VALUE_NULL] = getNullValueMapping(type);
  }

  return mapping;
}

const getNullValueMapping = type => {
  const baseMapping = {
    name: 'No data',
    value: MEASURE_VALUE_NULL,
  };

  switch (type) {
    case MEASURE_TYPE_ICON:
      baseMapping.icon = UNKNOWN_ICON;
      break;
    case MEASURE_TYPE_SHADING:
    case MEASURE_TYPE_COLOR:
      baseMapping.color = UNKNOWN_COLOR;
      break;
    default:
      break;
  }

  return baseMapping;
};

const getSpectrumScaleValues = (measureData, measureOption) => {
  const { key, scaleType, startDate, endDate } = measureOption;

  if (scaleType === SCALE_TYPES.TIME) {
    return { min: startDate, max: endDate };
  }

  const flattenedMeasureData = flattenNumericalMeasureData(measureData, key);

  if (flattenedMeasureData.length === 0) return { min: null, max: null };

  const dataMin = Math.min(...flattenedMeasureData);
  const dataMax = Math.max(...flattenedMeasureData);

  const { min, max } = clampScaleValues({ min: dataMin, max: dataMax }, measureOption);

  return { min, max };
};

const clampScaleValues = (dataBounds, measureOption) => {
  const { valueType, scaleBounds = {} } = measureOption;

  const defaultScale =
    valueType === VALUE_TYPES.PERCENTAGE
      ? PERCENTAGE_SPECTRUM_SCALE_DEFAULT
      : SPECTRUM_SCALE_DEFAULT;

  const leftBoundConfig = scaleBounds.left || defaultScale.left;
  const rightBoundConfig = scaleBounds.right || defaultScale.right;
  const { min: minDataValue, max: maxDataValue } = dataBounds;

  return {
    min: clampValue(minDataValue, leftBoundConfig),
    max: clampValue(maxDataValue, rightBoundConfig),
  };
};

const clampValue = (value, config) => {
  const { min, max } = config;
  let clampedValue = value;

  if ((min || min === 0) && min !== 'auto') clampedValue = Math.max(clampedValue, min);
  if ((max || max === 0) && max !== 'auto') clampedValue = Math.min(clampedValue, max);

  return clampedValue;
};

export function processMeasureInfo(response) {
  const { measureOptions, displayType, ...rest } = response;
  let { measureData } = response;
  const hiddenMeasures = {};
  const processedOptions = measureOptions.map(measureOption => {
    const { values: mapOptionValues, type } = measureOption;
    const values = autoAssignColors(mapOptionValues);
    const valueMapping = createValueMapping(values, type);

    hiddenMeasures[measureOption.key] = measureOption.hideByDefault;

    if (SPECTRUM_MEASURE_TYPES.includes(type)) {
      // for each spectrum, include the minimum and maximum values for
      // use in the legend scale labels.
      const { min, max } = getSpectrumScaleValues(measureData, measureOption);

      return {
        ...measureOption,
        values,
        valueMapping,
        min,
        max,
        noDataColour: MAP_COLORS.NO_DATA,
      };
    }

    return {
      ...measureOption,
      values,
      valueMapping,
    };
  });

  // remove measure units with no coordinates
  // for circle heatmap remove empty values or values that are not of positive float type
  if (displayType === MARKER_TYPES.CIRCLE_HEATMAP) {
    measureData = measureData.filter(({ value }) => {
      if (!value || value === '') return false;
      const parsedValue = parseFloat(value);
      return !Number.isNaN(parsedValue) && parsedValue >= 0;
    });
  }

  return {
    measureOptions: processedOptions,
    hiddenMeasures,
    measureData,
    ...rest,
  };
}

// Take a measureData array where the [key]: value is a number
// and filters NaN values (e.g. undefined).
export function flattenNumericalMeasureData(measureData, key) {
  return measureData.map(v => parseFloat(v[key])).filter(x => !isNaN(x));
}
