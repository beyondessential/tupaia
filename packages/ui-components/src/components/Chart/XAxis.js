/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Text, XAxis as XAxisComponent } from 'recharts';
import { CHART_TYPES, DARK_BLUE } from './constants';
import { formatTimestampForChart, getIsTimeSeries, getContrastTextColor } from './utils';
import { VerticalTick } from './VerticalTick';

const AXIS_TIME_PROPS = {
  dataKey: 'timestamp',
  type: 'number',
  scale: 'time',
  domain: ['dataMin', 'dataMax'],
};

const X_AXIS_PADDING = {
  enlarged: {
    dataLengthThreshold: 9,
    base: 20,
    offset: 30,
    minimum: 30,
  },
  preview: {
    dataLengthThreshold: 9,
    base: 4,
    offset: 10,
    minimum: 10,
  },
};

const renderXAxisLabel = (label, fillColor, isEnlarged) => {
  if (label)
    return {
      value: label,
      fill: fillColor,
      position: 'bottom',
      style: { fontSize: isEnlarged ? '1em' : '0.8em' },
    };
  return null;
};

const BASE_H = 40;

const calculateXAxisHeight = (data, isExporting) => {
  if (isExporting) {
    return Math.min(BASE_H + Math.max(...data.map(item => item.name.length)) * 6, 190);
  }
  return BASE_H;
};

export const XAxis = ({ viewContent, isExporting, isEnlarged }) => {
  const fillColor = isExporting ? DARK_BLUE : getContrastTextColor();
  const { BAR, COMPOSED } = CHART_TYPES;
  const { chartType, chartConfig = {}, data } = viewContent;
  const axisHeight = calculateXAxisHeight(data, isExporting);

  /*
    If set 0, all the ticks will be shown.
    If set preserveStart", "preserveEnd" or "preserveStartEnd", the ticks which is to be shown or hidden will be calculated automatically.
    @see https://recharts.org/en-US/api/YAxis
  */
  const getXAxisTickInterval = () => {
    if (chartType === BAR || chartType === COMPOSED) {
      return isExporting ? 0 : 'preserveStartEnd';
    }

    return isEnlarged ? 'preserveStartEnd' : 0;
  };

  const formatXAxisTick = tickData => {
    const { periodGranularity, presentationOptions = {} } = viewContent;
    const { periodTickFormat } = presentationOptions;

    return getIsTimeSeries(data)
      ? formatTimestampForChart(tickData, periodGranularity, periodTickFormat)
      : tickData;
  };

  const renderTickFirstAndLastLabel = tickProps => {
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
    return isEnlarged || chartType === BAR ? undefined : renderTickFirstAndLastLabel;
  };

  const getXAxisPadding = () => {
    const hasBars =
      chartType === BAR ||
      Object.values(chartConfig).some(({ chartType: composedType }) => composedType === BAR);

    if (hasBars && data.length > 1 && getIsTimeSeries(data)) {
      const paddingKey = isEnlarged ? 'enlarged' : 'preview';
      const { dataLengthThreshold, base, offset, minimum } = X_AXIS_PADDING[paddingKey];
      const padding = Math.max(minimum, (dataLengthThreshold - data.length) * base + offset);
      return { left: padding, right: padding };
    }

    return { left: 0, right: 0 };
  };

  const renderVerticalTick = tickProps => {
    const { payload, ...restOfProps } = tickProps;

    return (
      <VerticalTick
        {...restOfProps}
        viewContent={viewContent}
        payload={{
          ...payload,
          value: formatXAxisTick(payload.value),
        }}
      />
    );
  };

  return (
    <XAxisComponent
      dataKey="name"
      label={renderXAxisLabel(viewContent?.xName, fillColor, isEnlarged)}
      stroke={isExporting ? DARK_BLUE : fillColor}
      height={axisHeight}
      interval={getXAxisTickInterval()}
      tick={getXAxisTickMethod()}
      tickFormatter={formatXAxisTick}
      padding={getXAxisPadding()}
      tickSize={6}
      {...(getIsTimeSeries(data) ? AXIS_TIME_PROPS : {})}
    />
  );
};

XAxis.propTypes = {
  viewContent: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
  isEnlarged: PropTypes.bool,
};

XAxis.defaultProps = {
  isExporting: false,
  isEnlarged: false,
};
