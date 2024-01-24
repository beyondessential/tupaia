/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { PieChartConfig, PieChartPresentationOptions } from './pie';
import { BaseChartConfig, CartesianChartConfig, CartesianChartPresentationOptions } from './common';
import { BarChartConfig, BarChartPresentationOptions } from './bar';

/**
 * These are all the different chart config types. Anything that is more than the generic chart config has it's own file
 */

/**
 * @description Gauge Chart
 */
export type GaugeChartConfig = BaseChartConfig & {
  chartType: 'gauge';
};

/**
 * @description Line Chart
 */
export type LineChartConfig = CartesianChartConfig & {
  chartType: 'line';
};

/**
 * @description A Composed chart is a concept from Recharts, e.g. a line chart layered on top of a bar chart
 */
export type ComposedChartConfig = CartesianChartConfig & {
  chartType: 'composed';
};

export type ChartConfig =
  | GaugeChartConfig
  | ComposedChartConfig
  | BarChartConfig
  | PieChartConfig
  | LineChartConfig;

export type ChartPresentationOptions =
  | BarChartPresentationOptions
  | PieChartPresentationOptions
  | CartesianChartPresentationOptions;
