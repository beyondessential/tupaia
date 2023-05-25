/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { formatDataValueByType } from '@tupaia/utils';
import { ValueType } from '@tupaia/types';
import { YAxis as YAxisComponent } from 'recharts';
import { DARK_BLUE } from '../../constants';
import { LooseObject, ViewContent } from '../../types';
import { getContrastTextColor } from '../../utils';

interface AxisDomainProps {
  min: number;
  max: number;
  value: any;
  type: any;
}

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

const parseDomainConfig = (config: AxisDomainProps) => {
  switch (config.type) {
    case 'scale':
      return (dataExtreme: any) => dataExtreme * config.value;
    case 'clamp':
      return (dataExtreme: any) => {
        const maxClampedVal = config.max ? Math.min(dataExtreme, config.max) : dataExtreme;
        return config.min ? Math.max(maxClampedVal, config.min) : maxClampedVal;
      };
    case 'number':
    case 'string':
    default:
      return config.value;
  }
};

const getDefaultYAxisDomain = (viewContent: ViewContent) =>
  viewContent.valueType === 'percentage' ? PERCENTAGE_Y_DOMAIN : DEFAULT_Y_AXIS.yAxisDomain;

const calculateYAxisDomain = ({ min, max }: { min: AxisDomainProps; max: AxisDomainProps }) => {
  return [parseDomainConfig(min), parseDomainConfig(max)];
};

const containsClamp = ({ min, max }: { min: AxisDomainProps; max: AxisDomainProps }) =>
  min.type === 'clamp' || max.type === 'clamp';

const renderYAxisLabel = (
  label: string,
  orientation: string,
  fillColor: string,
  isEnlarged: boolean,
) => {
  if (label)
    return {
      value: label,
      angle: -90,
      fill: fillColor,
      style: { textAnchor: 'middle', fontSize: isEnlarged ? '1em' : '0.8em' },
      position: orientation === 'right' ? 'insideRight' : 'insideLeft',
    };
  return null;
};

/**
 * Calculate a dynamic width for the YAxis
 */
const getAxisWidth = (data: any[], dataKeys: string[], valueType: ValueType) => {
  // Only use a dynamic width for number types. Otherwise fallback to the recharts default
  if (valueType === 'number' || valueType === undefined) {
    const values = data.map(item => dataKeys.map(key => item[key])).flat();
    const maxValue = Math.max(...values);

    // Format the number in the same way that it will be displayed to take into account any rounding
    const maxFormattedValue =
      valueType === undefined
        ? formatDataValueByType(
            { value: maxValue, metadata: { presentationOptions: { valueFormat: '0.00' } } },
            'number',
          )
        : formatDataValueByType({ value: maxValue }, valueType);
    const maxValueLength = maxFormattedValue.toString().length;
    return maxValueLength * 8 + 32;
  }

  return undefined;
};

const YAxis = ({
  config = {
    yAxisId: DEFAULT_Y_AXIS.id,
    orientation: DEFAULT_Y_AXIS.orientation,
    yAxisDomain: '',
    yName: '',
  },
  viewContent,
  chartDataConfig,
  isExporting = false,
  isEnlarged = false,
}: any) => {
  const fillColor = isExporting ? DARK_BLUE : getContrastTextColor();

  const {
    yAxisId,
    orientation,
    yAxisDomain = getDefaultYAxisDomain(viewContent),
    yName: yAxisLabel,
  } = config;

  const { yName, presentationOptions, ticks } = viewContent;
  const dataKeys = config.dataKeys || Object.keys(chartDataConfig);
  const valueType = viewContent.valueType || config.valueType;
  const width = getAxisWidth(viewContent.data, dataKeys, valueType);

  return (
    // @ts-ignore
    <YAxisComponent
      key={yAxisId}
      ticks={ticks}
      width={width}
      tickSize={6}
      yAxisId={yAxisId}
      orientation={orientation}
      domain={calculateYAxisDomain(yAxisDomain)}
      allowDataOverflow={valueType === 'percentage' || containsClamp(yAxisDomain)}
      // The above 2 props stop floating point imprecision making Y axis go above 100% in stacked charts.
      label={renderYAxisLabel(yName || yAxisLabel, orientation, fillColor, isEnlarged)}
      tickFormatter={value =>
        formatDataValueByType(
          {
            value,
            metadata: { presentationOptions },
          },
          valueType,
        )
      }
      interval={isExporting ? 0 : 'preserveStartEnd'}
      stroke={fillColor}
      padding={{ top: 10 }}
    />
  );
};

interface YAxesProps {
  yAxisConfigs: any[];
  orientation: 'left' | 'right';
  valueType: string;
  yName: string;
}

export const YAxes = ({
  viewContent,
  chartDataConfig,
  isExporting = false,
  isEnlarged = false,
}: any) => {
  const { chartConfig }: { chartConfig: YAxesProps } = viewContent;

  const axisPropsById: { [p: number]: LooseObject } = {
    [Y_AXIS_IDS.left]: { yAxisId: Y_AXIS_IDS.left, dataKeys: [], orientation: 'left' },
    [Y_AXIS_IDS.right]: { yAxisId: Y_AXIS_IDS.right, dataKeys: [], orientation: 'right' },
  };

  Object.entries(chartConfig).forEach(
    ([dataKey, { yAxisOrientation: orientation, valueType, yAxisDomain, yName }]) => {
      const axisId = Y_AXIS_IDS[orientation as 'left' | 'right'] || DEFAULT_Y_AXIS.id;
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
  const baseProps = { viewContent, chartDataConfig, isExporting, isEnlarged };

  // If no custom axes provided, render the  default y axis
  return axesProps.length > 0
    ? axesProps.map(props => YAxis({ config: props, ...baseProps }))
    : YAxis(baseProps);
};
