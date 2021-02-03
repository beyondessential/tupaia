/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Bar, LabelList } from 'recharts';
import { formatDataValue } from '../utils';
import { CHART_TYPES } from './chartTypes';
import { BLUE } from '../constants';

export const BarChart = ({
  color = BLUE,
  dataKey,
  yAxisId,
  stackId,
  valueType,
  data,
  isEnlarged,
  isExporting,
  chartConfig,
}) => {
  const getBarSize = () => {
    if (chartConfig.chartType === CHART_TYPES.COMPOSED || data.length === 1) {
      return isEnlarged ? 100 : 50;
    }
    return undefined;
  };

  return (
    <Bar
      key={dataKey}
      dataKey={dataKey}
      yAxisId={yAxisId}
      stackId={stackId}
      fill={color}
      isAnimationActive={isEnlarged && !isExporting}
      barSize={getBarSize()}
    >
      {isExporting && !stackId && (
        <LabelList
          dataKey={dataKey}
          position="insideTop"
          offset={chartConfig ? -15 : -12}
          formatter={value => formatDataValue(value, valueType)}
        />
      )}
    </Bar>
  );
};

BarChart.propTypes = {
  chartConfig: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  data: PropTypes.array.isRequired,
};

BarChart.defaultProps = {
  isExporting: false,
  isEnlarged: false,
};
