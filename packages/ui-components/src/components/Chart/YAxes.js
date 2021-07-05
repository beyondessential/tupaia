/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { formatDataValueByType } from '@tupaia/utils';
import { YAxis as YAxisComponent } from 'recharts';
import { DARK_BLUE, VALUE_TYPES } from './constants';
import { getContrastTextColor } from './utils';

const { PERCENTAGE } = VALUE_TYPES;

const Y_AXIS_IDS = {
  left: 0,
  right: 1,
};

const PERCENTAGE_Y_DOMAIN = {
  min: { type: 'number', value: 0 },
  max: { type: 'string', value: 'dataMax' },
};

const DEFAULT_Y_AXIS = {
  id: Y_AXIS_IDS.left,
  orientation: 'left',
  yAxisDomain: {
    min: { type: 'number', value: 0 },
    max: { type: 'string', value: 'auto' },
  },
};

const parseDomainConfig = config => {
  switch (config.type) {
    case 'scale':
      return dataExtreme => dataExtreme * config.value;
    case 'clamp':
      return dataExtreme => {
        const maxClampedVal = config.max ? Math.min(dataExtreme, config.max) : dataExtreme;
        return config.min ? Math.max(maxClampedVal, config.min) : maxClampedVal;
      };
    case 'number':
    case 'string':
    default:
      return config.value;
  }
};

const getDefaultYAxisDomain = viewContent =>
  viewContent.valueType === PERCENTAGE ? PERCENTAGE_Y_DOMAIN : DEFAULT_Y_AXIS.yAxisDomain;

const calculateYAxisDomain = ({ min, max }) => {
  return [parseDomainConfig(min), parseDomainConfig(max)];
};

const containsClamp = ({ min, max }) => min.type === 'clamp' || max.type === 'clamp';

const renderYAxisLabel = (label, orientation, fillColor) => {
  if (label)
    return {
      value: label,
      angle: -90,
      fill: fillColor,
      style: { textAnchor: 'middle' },
      position: orientation === 'right' ? 'insideRight' : 'insideLeft',
    };
  return null;
};

const YAxis = ({ config = {}, viewContent, isExporting }) => {
  const fillColor = getContrastTextColor();

  const {
    yAxisId = DEFAULT_Y_AXIS.id,
    orientation = DEFAULT_Y_AXIS.orientation,
    yAxisDomain = getDefaultYAxisDomain(viewContent),
    valueType: axisValueType,
    yName: yAxisLabel,
  } = config;

  const { yName, valueType, presentationOptions, ticks } = viewContent;

  return (
    <YAxisComponent
      key={yAxisId}
      ticks={ticks}
      tickSize={6}
      yAxisId={yAxisId}
      orientation={orientation}
      domain={calculateYAxisDomain(yAxisDomain)}
      allowDataOverflow={valueType === PERCENTAGE || containsClamp(yAxisDomain)}
      // The above 2 props stop floating point imprecision making Y axis go above 100% in stacked charts.
      label={renderYAxisLabel(yName || yAxisLabel, orientation, fillColor)}
      tickFormatter={value =>
        formatDataValueByType(
          {
            value,
            metadata: { presentationOptions },
          },
          valueType || axisValueType,
        )
      }
      interval={isExporting ? 0 : 'preserveStartEnd'}
      stroke={isExporting ? DARK_BLUE : fillColor}
    />
  );
};

YAxis.propTypes = {
  config: PropTypes.object,
  viewContent: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
};

YAxis.defaultProps = {
  config: {},
  isExporting: false,
};

export const YAxes = ({ viewContent, isExporting }) => {
  const { chartConfig = {} } = viewContent;

  const axisPropsById = {
    [Y_AXIS_IDS.left]: { yAxisId: Y_AXIS_IDS.left, dataKeys: [], orientation: 'left' },
    [Y_AXIS_IDS.right]: { yAxisId: Y_AXIS_IDS.right, dataKeys: [], orientation: 'right' },
  };

  Object.entries(chartConfig).forEach(
    ([dataKey, { yAxisOrientation: orientation, valueType, yAxisDomain, yName }]) => {
      const axisId = Y_AXIS_IDS[orientation] || DEFAULT_Y_AXIS.id;
      axisPropsById[axisId].dataKeys.push(dataKey);
      if (valueType) {
        axisPropsById[axisId].valueType = valueType;
      }
      if (yName) {
        axisPropsById[axisId].yName = yName;
      }
      axisPropsById[axisId].yAxisDomain = yAxisDomain;
    },
  );

  const axesProps = Object.values(axisPropsById).filter(({ dataKeys }) => dataKeys.length > 0);
  // If no custom axes provided, render the  default y axis
  return axesProps.length > 0
    ? axesProps.map(props => YAxis({ config: props, viewContent, isExporting }))
    : YAxis({ viewContent, isExporting });
};

YAxes.propTypes = {
  viewContent: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
};

YAxes.defaultProps = {
  isExporting: false,
};
