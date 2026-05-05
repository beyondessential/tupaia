import { uniq } from 'es-toolkit';
import React from 'react';

import { VALUE_TYPES, formatDataValueByType } from '@tupaia/utils';
import { CartesianChartConfig, ChartReport, ValueType } from '@tupaia/types';
import { YAxis as YAxisComponent, YAxisProps } from 'recharts';
import { DARK_BLUE } from '../../constants';
import { LooseObject } from '../../types';
import { getContrastTextColor } from '../../utils';

interface AxisDomainProps {
  min?: number;
  max?: number;
  value: any;
  type: any;
}

enum Orientation {
  left = 'left',
  right = 'right',
}

const Y_AXIS_IDS = {
  [Orientation.left]: 0,
  [Orientation.right]: 1,
};

const PERCENTAGE_Y_DOMAIN = {
  min: { type: 'number', value: 0 },
  max: { type: 'string', value: 'dataMax' },
};

const DEFAULT_Y_AXIS = {
  id: Y_AXIS_IDS.left,
  orientation: Orientation.left,
  yAxisDomain: {
    min: { type: 'number', value: 0 },
    max: { type: 'string', value: 'auto' },
  },
};

const parseDomainConfig = (axisDomainConfig: AxisDomainProps) => {
  switch (axisDomainConfig.type) {
    case 'scale':
      return (dataExtreme: any) => dataExtreme * axisDomainConfig.value;
    case 'clamp':
      return (dataExtreme: any) => {
        const maxClampedVal = axisDomainConfig.max
          ? Math.min(dataExtreme, axisDomainConfig.max)
          : dataExtreme;
        return axisDomainConfig.min ? Math.max(maxClampedVal, axisDomainConfig.min) : maxClampedVal;
      };
    case 'number':
    case 'string':
    default:
      return axisDomainConfig.value;
  }
};

const getDefaultYAxisDomain = (axisConfig: CartesianChartConfig) =>
  axisConfig.valueType === 'percentage' ? PERCENTAGE_Y_DOMAIN : DEFAULT_Y_AXIS.yAxisDomain;

const calculateYAxisDomain = ({
  min,
  max,
}: {
  min: AxisDomainProps;
  max: AxisDomainProps;
}): YAxisProps['domain'] => {
  return [parseDomainConfig(min), parseDomainConfig(max)];
};

const containsClamp = ({ min, max }: { min: AxisDomainProps; max: AxisDomainProps }) =>
  min.type === 'clamp' || max.type === 'clamp';

const renderYAxisLabel = (
  label: string,
  orientation: Orientation,
  fillColor: string,
  isEnlarged: boolean,
) => {
  if (label)
    return {
      value: label,
      angle: -90,
      fill: fillColor,
      style: { textAnchor: 'middle', fontSize: isEnlarged ? '1em' : '0.8em' },
      position: orientation === Orientation.right ? 'insideRight' : 'insideLeft',
    };

  return undefined;
};

const flattenValues = (data?: any[], dataKeys?: string[]) => {
  if (!data) return [];
  return data?.flatMap(item => dataKeys?.map(key => item[key]));
};

/**
 * Calculate a dynamic width for the YAxis
 */
const getAxisWidth = (data: ChartReport['data'], dataKeys: string[], valueType?: ValueType) => {
  // Only use a dynamic width for number types. Otherwise fallback to the recharts default
  if (valueType === 'number' || valueType === undefined) {
    const maxValue = Math.max(...flattenValues(data, dataKeys));

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

const getDefaultNumberFormat = (data: ChartReport['data'], dataKeys: string[]) => {
  const uniqueValues = uniq(flattenValues(data, dataKeys));
  const maxValue = Math.max(...uniqueValues);
  // if the maxValue is greater than 4, there will already be multiple ticks visible that are whole numbers, so we can use the default format of 0,0, as used in utils
  if (maxValue >= 4) return '0,0';
  // if the maxValue is less than 4, we want to show 2 decimal places, so we that we don't have repeated tick values from rounding, so we can use the default format of 0.00
  return '0.00';
};

type CustomAxisConfig = {
  yAxisId?: number;
  orientation?: Orientation;
  yAxisDomain?: {
    min: AxisDomainProps;
    max: AxisDomainProps;
  };
  dataKeys?: string[];
  valueType?: ValueType;
  yName?: string;
};
interface YAxisComponentProps {
  config: CartesianChartConfig;
  report: ChartReport;
  axisConfig?: CustomAxisConfig;
  chartDataConfig: CartesianChartConfig['chartConfig'];
  isExporting?: boolean;
  isEnlarged?: boolean;
}

const YAxis = ({
  axisConfig = {},
  config,
  report,
  chartDataConfig,
  isExporting = false,
  isEnlarged = false,
}: YAxisComponentProps) => {
  const fillColor = isExporting ? DARK_BLUE : getContrastTextColor();

  const {
    yAxisId = DEFAULT_Y_AXIS.id,
    orientation = DEFAULT_Y_AXIS.orientation,
    yAxisDomain = getDefaultYAxisDomain(config),
    yName: yAxisLabel,
  } = axisConfig;

  const { yName, presentationOptions, ticks } = config;
  const dataKeys = axisConfig.dataKeys || (chartDataConfig && Object.keys(chartDataConfig)) || [];
  const valueType = config.valueType || axisConfig.valueType;
  const width = getAxisWidth(report.data, dataKeys, valueType);

  // this is to stop a bug where if there is no value format set, the axis will round decimals to while values, which is undesirable behaviour when the max axis value is less than 3
  const defaultFormatter =
    valueType === VALUE_TYPES.NUMBER ? getDefaultNumberFormat(report.data, dataKeys) : undefined;
  return (
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
      // @ts-ignore recharts XAxisProps is nat handling receiving undefined as a value
      label={renderYAxisLabel(yName || yAxisLabel, orientation, fillColor, isEnlarged)}
      tickFormatter={value =>
        formatDataValueByType(
          {
            value,
            metadata: {
              presentationOptions: {
                ...(presentationOptions || {}),
                valueFormat:
                  (presentationOptions &&
                    'valueFormat' in presentationOptions &&
                    presentationOptions?.valueFormat) ||
                  defaultFormatter,
              },
            },
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
  config: CartesianChartConfig;
  report: ChartReport;
  chartDataConfig: CartesianChartConfig['chartConfig'];
  isExporting?: boolean;
  isEnlarged?: boolean;
}

export const YAxes = ({
  config,
  report,
  chartDataConfig,
  isExporting = false,
  isEnlarged = false,
}: YAxesProps) => {
  const { chartConfig } = config;

  const axisPropsById: { [p: number]: LooseObject } = {
    [Y_AXIS_IDS.left]: { yAxisId: Y_AXIS_IDS.left, dataKeys: [], orientation: Orientation.left },
    [Y_AXIS_IDS.right]: { yAxisId: Y_AXIS_IDS.right, dataKeys: [], orientation: Orientation.right },
  };

  if (chartConfig) {
    Object.entries(chartConfig).forEach(
      ([dataKey, { yAxisOrientation: orientation, valueType, yAxisDomain, yName }]) => {
        const axisId = Y_AXIS_IDS[orientation as Orientation] || DEFAULT_Y_AXIS.id;
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
  }

  const axesProps = Object.values(axisPropsById).filter(({ dataKeys }) => dataKeys.length > 0);
  const baseProps = { report, config, chartDataConfig, isExporting, isEnlarged };

  // If no custom axes provided, render the  default y axis
  return axesProps.length > 0
    ? axesProps.map(props => YAxis({ axisConfig: props, ...baseProps }))
    : YAxis(baseProps);
};
