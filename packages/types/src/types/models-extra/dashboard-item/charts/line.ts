import { BaseChartConfig, CartesianChartConfig, ChartConfigObject, ChartType } from './common';

export interface LineChartChartConfig extends ChartConfigObject {
  /**
   * @description Whether the line should show a dot at each data point
   */
  dot?: boolean;

  /**
   * @description Whether to draw a connecting line between gaps in the data
   */
  connectNulls?: boolean;

  /**
   * @description The pattern of dashes and gaps used to paint the line, see: https://recharts.org/en-US/api/Line#strokeDasharray
   */
  strokeDasharray?: string;
}

/**
 * @description Line Chart
 */
export interface LineChartConfig extends Omit<CartesianChartConfig, 'chartConfig'> {
  chartType: ChartType.Line;

  /**
   * @description
   * Configuration for each series of data within this chart.
   * Note: use $all for configuration that applies to all series.
   *
   * eg.
   *  {
   *    In Stock: {
   *      color: green
   *    }
   *    Out of Stock: {
   *      color: red
   *    }
   *    $all: {
   *      hideFromLegend: true
   *    }
   *  }
   */
  chartConfig?: {
    [key: string]: LineChartChartConfig;
  };
}

export const isLineChartConfig = (config: BaseChartConfig): config is LineChartConfig =>
  config.chartType === ChartType.Line;
