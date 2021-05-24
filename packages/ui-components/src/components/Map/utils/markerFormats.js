/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { formatDataValueByType } from '@tupaia/utils';
import { resolveSpectrumColour } from './markerColors';
import {
  YES_COLOR,
  NO_COLOR,
  BREWER_AUTO,
  UNKNOWN_COLOR,
  MAP_COLORS,
  SCALE_TYPES,
} from '../constants';
import { SPECTRUM_ICON, DEFAULT_ICON, UNKNOWN_ICON } from '../Markers/markerIcons';

export const MEASURE_TYPE_ICON = 'icon';
export const MEASURE_TYPE_COLOR = 'color';
export const MEASURE_TYPE_RADIUS = 'radius';
export const MEASURE_TYPE_SPECTRUM = 'spectrum';
export const MEASURE_TYPE_SHADING = 'shading';
export const MEASURE_TYPE_SHADED_SPECTRUM = 'shaded-spectrum';

export const MEASURE_VALUE_OTHER = 'other';
export const MEASURE_VALUE_NULL = 'null';

export const POLYGON_MEASURE_TYPES = [MEASURE_TYPE_SHADING, MEASURE_TYPE_SHADED_SPECTRUM];
export const SPECTRUM_MEASURE_TYPES = [MEASURE_TYPE_SPECTRUM, MEASURE_TYPE_SHADED_SPECTRUM];

const SPECTRUM_SCALE_DEFAULT = { left: {}, right: {} };
const PERCENTAGE_SPECTRUM_SCALE_DEFAULT = { left: { max: 0 }, right: { min: 1 } };

export function autoAssignColors(values) {
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

export function createValueMapping(valueObjects, type) {
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

function getFormattedValue(value, type, valueInfo, scaleType, valueType, submissionDate) {
  switch (type) {
    case MEASURE_TYPE_SPECTRUM:
    case MEASURE_TYPE_SHADED_SPECTRUM:
      if (scaleType === SCALE_TYPES.TIME) {
        return `last submission on ${submissionDate}`;
      }
      return formatDataValueByType({ value }, valueType);
    case MEASURE_TYPE_RADIUS:
    case MEASURE_TYPE_ICON:
    case MEASURE_TYPE_COLOR:
    case MEASURE_TYPE_SHADING:
      if (scaleType === SCALE_TYPES.TIME) {
        return `last submission on ${submissionDate}`;
      }
      return valueInfo.name || value;
    default:
      return value;
  }
}

export const getSpectrumScaleValues = (measureData, series) => {
  const { key, scaleType, startDate, endDate } = series;

  if (scaleType === SCALE_TYPES.TIME) {
    return { min: startDate, max: endDate };
  }

  const flattenedMeasureData = flattenNumericalMeasureData(measureData, key);

  if (flattenedMeasureData.length === 0) return { min: null, max: null };

  const dataMin = Math.min(...flattenedMeasureData);
  const dataMax = Math.max(...flattenedMeasureData);

  const { min, max } = clampScaleValues({ min: dataMin, max: dataMax }, series);

  return { min, max };
};

const clampScaleValues = (dataBounds, series) => {
  const { valueType, scaleBounds = {} } = series;

  const defaultScale =
    valueType === 'percentage' ? PERCENTAGE_SPECTRUM_SCALE_DEFAULT : SPECTRUM_SCALE_DEFAULT;

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

export function flattenMeasureHierarchy(measureHierarchy) {
  const results = [];
  const flattenGroupedMeasure = ({ children }) => {
    children.forEach(childObject => {
      if (childObject.children && childObject.children.length) {
        flattenGroupedMeasure(childObject);
      } else {
        results.push(childObject);
      }
    });
  };
  measureHierarchy.forEach(measure => {
    if (measure.children) {
      flattenGroupedMeasure(measure);
    } else {
      results.push(measure);
    }
  });

  return results;
}

const getIsHidden = (measureData, serieses, allHiddenValues) =>
  serieses
    .map(({ key, valueMapping, hideByDefault }) => {
      const value = measureData[key];
      const hiddenValues = {
        ...hideByDefault,
        ...allHiddenValues[key],
      };

      // use 'no data' value if value is null and there is a null mapping defined
      if (!value && typeof value !== 'number' && valueMapping.null) {
        return hiddenValues.null || hiddenValues[valueMapping.null.value];
      }

      const matchedValue = valueMapping[value];

      if (!matchedValue) {
        // use 'other' value
        return hiddenValues.other;
      }

      return hiddenValues[matchedValue.value];
    })
    .some(isHidden => isHidden);

function getValueInfo(value, valueMapping) {
  // use 'no data' value if value is null and there is a null mapping defined
  if (!value && typeof value !== 'number' && valueMapping.null) {
    return {
      ...valueMapping.null,
    };
  }

  const matchedValue = valueMapping[value];

  if (!matchedValue) {
    // use 'other' value
    return {
      ...valueMapping.other,
      value,
    };
  }

  return {
    ...matchedValue,
  };
}

// For situations where we can only show one value, just show the value
// of the first measure.
export const getSingleFormattedValue = (markerData, series) =>
  getFormattedInfo(markerData, series[0]).formattedValue;

export function getFormattedInfo(markerData, series) {
  const { key, valueMapping, type, displayedValueKey, scaleType, valueType } = series;
  const value = markerData[key];
  const valueInfo = getValueInfo(value, valueMapping);

  if (displayedValueKey && (markerData[displayedValueKey] || markerData[displayedValueKey] === 0)) {
    return {
      formattedValue: formatDataValueByType(
        { value: markerData[displayedValueKey], metadata: markerData.metadata },
        valueType,
      ),
      valueInfo,
    };
  }

  // note: dont use !value here, as 0 is a valid value.
  if (value === null || value === undefined) {
    return { formattedValue: valueInfo.name || 'No data', valueInfo };
  }

  return {
    formattedValue: getFormattedValue(
      value,
      type,
      valueInfo,
      scaleType,
      valueType,
      markerData.submissionDate,
    ),
    valueInfo,
  };
}

export function getMeasureDisplayInfo(
  measureData = {},
  serieses,
  hiddenValues = {},
  radiusScaleFactor = 1,
) {
  const isHidden = getIsHidden(measureData, serieses, hiddenValues);
  const displayInfo = {
    isHidden,
  };

  serieses.forEach(({ color, icon, radius }) => {
    if (color) {
      displayInfo.color = color;
    }
    if (icon) {
      displayInfo.icon = icon;
    }
    if (radius) {
      displayInfo.radius = radius;
    }
  });

  serieses.forEach(
    ({ key, type, valueMapping, noDataColour, scaleType, scaleColorScheme, min, max }) => {
      const valueInfo = getValueInfo(measureData[key], valueMapping);

      displayInfo.originalValue = measureData.originalValue;

      switch (type) {
        case MEASURE_TYPE_ICON:
          displayInfo.icon = valueInfo.icon;
          displayInfo.color = displayInfo.color || valueInfo.color;
          break;
        case MEASURE_TYPE_RADIUS:
          displayInfo.radius = valueInfo.value * radiusScaleFactor || 0;
          displayInfo.color = displayInfo.color || valueInfo.color;
          break;
        case MEASURE_TYPE_SPECTRUM:
        case MEASURE_TYPE_SHADED_SPECTRUM:
          displayInfo.originalValue =
            valueInfo.value === null || valueInfo.value === undefined ? 'No data' : valueInfo.value;
          displayInfo.color = resolveSpectrumColour(
            scaleType,
            scaleColorScheme,
            valueInfo.value || (valueInfo.value === 0 ? 0 : null),
            min,
            max,
            noDataColour,
          );
          displayInfo.icon = valueInfo.icon || displayInfo.icon || SPECTRUM_ICON;
          break;
        case MEASURE_TYPE_SHADING:
          displayInfo.color = MAP_COLORS[valueInfo.color] || valueInfo.color || MAP_COLORS.NO_DATA;
          break;
        case MEASURE_TYPE_COLOR:
        default:
          displayInfo.color = valueInfo.color;
          break;
      }
    },
  );

  if (!displayInfo.icon && typeof displayInfo.radius === 'undefined') {
    displayInfo.icon = DEFAULT_ICON;
  }

  if (!displayInfo.color) {
    displayInfo.color = UNKNOWN_COLOR;
  }

  return displayInfo;
}

const MAX_ALLOWED_RADIUS = 1000;

export const calculateRadiusScaleFactor = measureData => {
  // Check if any of the radii in the dataset are larger than the max allowed
  // radius, and scale everything down proportionally if so.
  // (this needs to happen here instead of inside the circle marker component
  // because it needs to operate on the dataset level, not the datapoint level)
  const maxRadius = measureData
    .map(d => parseInt(d.radius, 10) || 1)
    .reduce((state, current) => Math.max(state, current), 0);
  return maxRadius < MAX_ALLOWED_RADIUS ? 1 : (1 / maxRadius) * MAX_ALLOWED_RADIUS;
};

// Take a measureData array where the [key]: value is a number
// and filters NaN values (e.g. undefined).
export function flattenNumericalMeasureData(measureData, key) {
  return measureData.map(v => parseFloat(v[key])).filter(x => !isNaN(x));
}
