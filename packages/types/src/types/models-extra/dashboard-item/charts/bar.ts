import { CssColor } from '../../../css';
import {
  BaseChartConfig,
  CartesianChartConfig,
  CartesianChartPresentationOptions,
  ChartType,
} from './common';

export type BarChartPresentationOptions = CartesianChartPresentationOptions & {
  color?: CssColor;
  /**
   * @description This can be anything from the [numeraljs library]{@link http://numeraljs.com/#format}
   */
  valueFormat?: string;
};

/**
 * @description Bar Chart
 */
export type BarChartConfig = CartesianChartConfig & {
  chartType: ChartType.Bar;

  /**
   * @description Common options for configuring the chart presentation
   */
  presentationOptions?: BarChartPresentationOptions;
};

export const isBarChartConfig = (config: BaseChartConfig): config is BarChartConfig =>
  config.chartType === ChartType.Bar;
