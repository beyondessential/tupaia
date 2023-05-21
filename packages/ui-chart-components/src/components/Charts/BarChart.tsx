/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Bar, LabelList } from 'recharts';
import { BarChartConfig, ComposedChartConfig } from '@tupaia/types';
import { formatDataValueByType } from '@tupaia/utils';
import { BLUE } from '../../constants';
import { ChartType } from '../../types';
import { getIsTimeSeries } from '../../utils';

interface DataProps {
  name: string;
  value: string;
  timestamp?: string;
}

interface BarChartProps {
  dataKey: string;
  yAxisId: string | number;
  stackId: string;
  valueType: string;
  color?: string;
  data: DataProps[];
  isEnlarged?: boolean;
  isExporting?: boolean;
  chartConfig: BarChartConfig | ComposedChartConfig;
  exportWithLabels?: boolean;
}

export const BarChart = ({
  color = BLUE,
  dataKey,
  yAxisId,
  stackId,
  valueType,
  data,
  isEnlarged = false,
  isExporting = false,
  chartConfig,
  exportWithLabels = true,
}: BarChartProps) => {
  const getBarSize = () => {
    if (chartConfig.chartType === ChartType.Composed || data.length === 1) {
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
