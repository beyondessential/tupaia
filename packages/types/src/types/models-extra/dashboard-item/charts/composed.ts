/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { CartesianChartConfig, ChartConfigObject, ChartType } from './common';

type ObjectT = ChartConfigObject & {
  chartType: ChartType.Line | ChartType.Bar;
};
type ComposedChartChildConfig = {
  [x: string]: ObjectT;
};
/**
 * @description A Composed chart is a concept from Recharts, e.g. a line chart layered on top of a bar chart
 */
export type ComposedChartConfig = Omit<CartesianChartConfig, 'chartConfig'> & {
  chartType: ChartType.Composed;
  chartConfig?: ComposedChartChildConfig;
};
