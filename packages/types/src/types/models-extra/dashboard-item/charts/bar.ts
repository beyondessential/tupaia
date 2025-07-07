import { CssColor } from '../../../css';
import {
  BaseChartConfig,
  CartesianChartConfig,
  CartesianChartPresentationOptions,
  ChartType,
} from './common';

export interface BarChartPresentationOptions extends CartesianChartPresentationOptions {
  color?: CssColor;
  /**
   * @description This can be anything from the [numeraljs library]{@link http://numeraljs.com/#format}
   */
  valueFormat?: string;
}

/**
 * @description Bar Chart
 */
export interface BarChartConfig extends CartesianChartConfig {
  chartType: ChartType.Bar;

  /**
   * @description Common options for configuring the chart presentation
   */
  presentationOptions?: BarChartPresentationOptions;
}

export const isBarChartConfig = (config: BaseChartConfig): config is BarChartConfig =>
  config.chartType === ChartType.Bar;
