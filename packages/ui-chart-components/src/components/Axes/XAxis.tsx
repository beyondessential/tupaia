import React from 'react';
import {
  LabelProps,
  Text,
  XAxis as XAxisComponent,
  XAxisProps as RechartsXAxisProps,
} from 'recharts';
import { CartesianChartConfig, ChartData, ChartReport, ChartType } from '@tupaia/types';
import { formatTimestampForChart, getContrastTextColor, getIsTimeSeries } from '../../utils';
import { DARK_BLUE } from '../../constants';
import { VerticalTick } from './VerticalTick';

const AXIS_TIME_PROPS = {
  dataKey: 'timestamp',
  type: 'number',
  scale: 'time',
  domain: ['dataMin', 'dataMax'],
} as RechartsXAxisProps; // cast these here because the component is complaining about the types of some of these being strings and not the enums etc that it expects

const X_AXIS_PADDING = {
  enlarged: {
    dataLengthThreshold: 9,
    base: 20,
    offset: 30,
    minimum: 30,
  },
  preview: {
    dataLengthThreshold: 9,
    base: 8,
    offset: 16,
    minimum: 10,
  },
};

const renderXAxisLabel = (
  label: string | undefined,
  fillColor: string | undefined,
  isEnlarged: boolean,
  isExporting: boolean
): LabelProps | undefined => {
  if (label && isEnlarged) {
    return {
      value: label,
      fill: fillColor,
      offset: isExporting ? -50 : -5,
      position: 'insideBottom',
    };
  }
  return undefined;
};

const BASE_H = 40;

const calculateXAxisHeight = (data: ChartData[], isExporting: boolean) => {
  if (getIsTimeSeries(data)) {
    return BASE_H;
  }

  if (isExporting) {
    return Math.min(BASE_H + Math.max(...data.map(item => item?.name?.length ?? 0)) || 5 * 6, 190);
  }
  return BASE_H;
};

interface XAxisProps {
  config: CartesianChartConfig;
  report: ChartReport;
  isEnlarged?: boolean;
  isExporting?: boolean;
}

export const XAxis = ({ config, report, isExporting = false, isEnlarged = false }: XAxisProps) => {
  const fillColor = isExporting ? DARK_BLUE : getContrastTextColor();
  const tickMargin = isExporting ? 20 : 0;
  const { Bar, Composed } = ChartType;
  const { chartType, chartConfig } = config;
  const { data = [] } = report;
  const axisHeight = calculateXAxisHeight(data, isExporting);
  const isTimeSeries = getIsTimeSeries(data);

  /*
    If set 0, all the ticks will be shown.
    If set preserveStart", "preserveEnd" or "preserveStartEnd", the ticks which is to be shown or hidden will be calculated automatically.
    @see https://recharts.org/en-US/api/YAxis
  */
  const getXAxisTickInterval = () => {
    if (chartType === Bar || chartType === Composed) {
      if (isTimeSeries) {
        return 'preserveStartEnd';
      }

      return isExporting ? 0 : 'preserveStartEnd';
    }

    return isEnlarged ? 'preserveStartEnd' : 0;
  };

  const formatXAxisTick = (tickData: string) => {
    const periodGranularity = 'periodGranularity' in config ? config.periodGranularity : undefined;

    const periodTickFormat = config?.presentationOptions?.periodTickFormat;

    return isTimeSeries
      ? formatTimestampForChart(tickData, periodGranularity, periodTickFormat)
      : tickData;
  };

  interface TickProps {
    index: number;
    payload: { value: string };
  }

  const renderTickFirstAndLastLabel = (tickProps: TickProps) => {
    const { index, payload } = tickProps;

    // Only render first and last ticks labels, the rest just have a tick mark without text
    if (index === 0 || index === data.length - 1) {
      // See https://github.com/recharts/recharts/blob/master/src/cartesian/CartesianAxis.js#L74
      return (
        <Text {...tickProps} className="recharts-cartesian-axis-tick-value">
          {formatXAxisTick(payload.value)}
        </Text>
      );
    }

    return null;
  };

  const getXAxisTickMethod = () => {
    if (isExporting) {
      return renderVerticalTick;
    }
    return isEnlarged || chartType === Bar ? undefined : renderTickFirstAndLastLabel;
  };

  const getXAxisPadding = () => {
    const hasBars =
      chartType === Bar ||
      (chartType === Composed &&
        chartConfig &&
        Object.values(chartConfig).some(({ chartType: composedType }) => composedType === Bar));

    if (hasBars && data.length > 1 && isTimeSeries) {
      const paddingKey = isEnlarged ? 'enlarged' : 'preview';
      const { dataLengthThreshold, base, offset, minimum } = X_AXIS_PADDING[paddingKey];
      const padding = Math.max(minimum, (dataLengthThreshold - data.length) * base + offset);
      return { left: padding, right: padding };
    }

    return { left: 0, right: 10 };
  };


  const renderVerticalTick = (tickProps: TickProps & { x: number; y: number }) => {
    const { payload, x, y } = tickProps;

    return (
      <VerticalTick
        x={x}
        y={y}
        payload={{
          value: formatXAxisTick(payload.value),
        }}
      />
    );
  };

  return (
    <XAxisComponent
      label={renderXAxisLabel(config?.xName, fillColor, isEnlarged, isExporting)}
      stroke={isExporting ? DARK_BLUE : fillColor}
      height={axisHeight}
      interval={getXAxisTickInterval()}
      tick={getXAxisTickMethod()}
      tickFormatter={formatXAxisTick}
      padding={getXAxisPadding()}
      tickMargin={tickMargin}
      {...(isTimeSeries ? AXIS_TIME_PROPS : { dataKey: 'name' })}
    />
  );
};
