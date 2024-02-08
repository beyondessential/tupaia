/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { BaseChartConfig, CartesianChartConfig, ChartConfigObject, ChartType } from './common';

export type ComposedChartConfigObject = ChartConfigObject & {
  chartType: ChartType.Line | ChartType.Bar;
};
type ComposedChartChildConfig = {
  [x: string]: ComposedChartConfigObject;
};
/**
 * @description A Composed chart is a concept from Recharts, e.g. a line chart layered on top of a bar chart
 */
export type ComposedChartConfig = Omit<CartesianChartConfig, 'chartConfig'> & {
  chartType: ChartType.Composed;
  chartConfig?: ComposedChartChildConfig;
};

export const isComposedChartConfig = (config: BaseChartConfig): config is ComposedChartConfig =>
  config.chartType === ChartType.Composed;
