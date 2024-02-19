/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { BaseChartConfig, CartesianChartConfig, ChartConfigObject, ChartType } from './common';

export type LineChartChartConfig = ChartConfigObject & {
  dot?: boolean;
  connectNulls?: boolean;
  strokeDasharray?: string;
};

/**
 * @description Line Chart
 */
export type LineChartConfig = Omit<CartesianChartConfig, 'chartConfig'> & {
  chartType: ChartType.Line;
  chartConfig?: {
    [key: string]: LineChartChartConfig;
  };
};

export const isLineChartConfig = (config: BaseChartConfig): config is LineChartConfig =>
  config.chartType === ChartType.Line;
