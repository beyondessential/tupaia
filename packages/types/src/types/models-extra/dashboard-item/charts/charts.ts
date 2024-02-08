/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { PieChartConfig, PieChartPresentationOptions } from './pie';
import {
  BaseChartConfig,
  CartesianChartConfig,
  CartesianChartPresentationOptions,
  ChartType,
} from './common';
import { BarChartConfig, BarChartPresentationOptions } from './bar';
import { ComposedChartConfig } from './composed';

/**
 * These are all the different chart config types. Anything that is more than the generic chart config has it's own file
 */

/**
 * @description Gauge Chart
 */
export type GaugeChartConfig = BaseChartConfig & {
  chartType: ChartType.Gauge;
};

export const isGaugeChartConfig = (config: BaseChartConfig): config is GaugeChartConfig =>
  config.chartType === ChartType.Gauge;

/**
 * @description Line Chart
 */
export type LineChartConfig = CartesianChartConfig & {
  chartType: ChartType.Line;
};

export const isLineChartConfig = (config: BaseChartConfig): config is LineChartConfig =>
  config.chartType === ChartType.Line;

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
