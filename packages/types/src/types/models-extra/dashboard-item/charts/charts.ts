import { PieChartConfig, PieChartPresentationOptions } from './pie';
import { BaseChartConfig, CartesianChartPresentationOptions, ChartType } from './common';
import { BarChartConfig, BarChartPresentationOptions } from './bar';
import { ComposedChartConfig } from './composed';
import { LineChartConfig } from './line';

/**
 * These are all the different chart config types. Anything that is more than the generic chart config has it's own file
 */

/**
 * @description Gauge Chart
 */
export interface GaugeChartConfig extends BaseChartConfig {
  chartType: ChartType.Gauge;
}

export const isGaugeChartConfig = (config: BaseChartConfig): config is GaugeChartConfig =>
  config.chartType === ChartType.Gauge;

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
