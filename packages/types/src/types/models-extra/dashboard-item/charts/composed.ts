import { BaseChartConfig, CartesianChartConfig, ChartConfigObject, ChartType } from './common';
import { LineChartChartConfig } from './line';

// composed chart config is a merge of the base chart config, line chart config and cartesian chart config because it contains multiple chart types
export type ComposedChartConfigObject = ChartConfigObject &
  LineChartChartConfig & {
    chartType: ChartType.Bar | ChartType.Line;
  };

/**
 * @description A Composed chart is a concept from Recharts, e.g. a line chart layered on top of a bar chart
 */
export type ComposedChartConfig = Omit<CartesianChartConfig, 'chartConfig'> & {
  chartType: ChartType.Composed;

  /**
   * @description
   * Configuration for each individual chart within this composed chart
   *
   * eg.
   *  {
   *    avg_rainfall: {
   *      chartType: line
   *      color: green
   *    }
   *    num_cases: {
   *      chartType: bar
   *      color: red
   *    }
   *  }
   */
  chartConfig?: {
    [key: string]: ComposedChartConfigObject;
  };
};

export const isComposedChartConfig = (config: BaseChartConfig): config is ComposedChartConfig =>
  config.chartType === ChartType.Composed;
