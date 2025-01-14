import React from 'react';
import { Bar, LabelList } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import {
  BarChartConfig,
  ChartConfigObject,
  ChartData,
  ChartReport,
  ChartType,
} from '@tupaia/types';
import { BLUE } from '../../constants';
import { getIsTimeSeries } from '../../utils';

interface BarChartProps extends ChartConfigObject {
  dataKey: string;
  yAxisId: string | number;
  isEnlarged?: boolean;
  isExporting?: boolean;
  exportWithLabels?: boolean;
  data: ChartData[];
  chartConfig: BarChartConfig['chartConfig'];
}

export const BarChart = ({
  color = BLUE,
  dataKey,
  yAxisId,
  stackId,
  valueType,
  chartType,
  isEnlarged = false,
  isExporting = false,
  chartConfig,
  exportWithLabels = false,
  data,
}: BarChartProps) => {
  const getBarSize = () => {
    if (chartType === ChartType.Composed || data.length === 1) {
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
