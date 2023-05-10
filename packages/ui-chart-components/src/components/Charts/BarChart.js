/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Bar, LabelList } from 'recharts';
import { formatDataValueByType, CHART_TYPES } from '@tupaia/utils';
import { BLUE } from '../../constants';
import { getIsTimeSeries } from '../../utils';

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
  exportWithLabels,
}) => {
  const getBarSize = () => {
    if (chartConfig.chartType === CHART_TYPES.COMPOSED || data.length === 1) {
      return isEnlarged ? 100 : 50;
    }
    // Too many stacks will automatically set bar size to 0.
    if (chartConfig && !isExporting && isEnlarged) {
      const chartConfigHasTooManyKeys = Object.keys(chartConfig).length > 10;
      const stacks = Object.values(chartConfig)
        .map(({ stackId: id }) => id)
        .filter(id => id !== undefined);

      const stackSize = new Set(stacks).size;
      const chartConfigHasTooManyStacks = stackSize > 10;

      if ((chartConfigHasTooManyKeys && stackSize === 0) || chartConfigHasTooManyStacks) {
        return 1;
      }
    }
    /* 
      [There is a known bug with Recharts](https://github.com/recharts/recharts/issues/2711) where if a bar graph is a time scale, it overflows the bars over the edge of the axes. 
      As a workaround, until it is fixed, setting the bar size to be a specific value stops this from happening.
    */
    if (getIsTimeSeries(data) && !isEnlarged) {
      return Math.max(1, Math.floor(200 / data.length));
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
      {isExporting && exportWithLabels && (
        <LabelList
          dataKey={dataKey}
          position="insideTop"
          offset={chartConfig ? -15 : -12}
          formatter={value => formatDataValueByType({ value }, valueType)}
        />
      )}
    </Bar>
  );
};

BarChart.propTypes = {
  dataKey: PropTypes.string.isRequired,
  yAxisId: PropTypes.string.isRequired,
  stackId: PropTypes.string.isRequired,
  valueType: PropTypes.string.isRequired,
  color: PropTypes.string,
  chartConfig: PropTypes.object.isRequired,
  isExporting: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  data: PropTypes.array.isRequired,
  exportWithLabels: PropTypes.bool,
};

BarChart.defaultProps = {
  color: BLUE,
  exportWithLabels: true,
  isExporting: false,
  isEnlarged: false,
};
