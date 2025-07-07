import { CssColor } from '../../../css';
import { ExportPresentationOptions } from '../common';
import { BaseChartConfig, ChartType } from './common';

interface PieOption {
  color?: CssColor;
  label?: string;
}

export interface PieChartSegmentConfig {
  [x: string]: {
    color?: CssColor;
    label?: string;
  };
}

export type PieChartPresentationOptions = ExportPresentationOptions & Record<string, PieOption>;

/**
 * @description Pie Chart
 */
export interface PieChartConfig extends BaseChartConfig {
  chartType: ChartType.Pie;

  /**
   * @description Common options for configuring the chart presentation
   */
  presentationOptions?: PieChartPresentationOptions;

  /**
   * @description
   * Configuration for segments of the pie chart, keyed by the 'name' column values
   * eg.
   * {
   *   "NEGATIVE": {
   *     "color": "#599bd7"
   *   },
   *   "POSITIVE": {
   *     "color": "#4636AE"
   *   }
   * }
   */
  segmentConfig?: PieChartSegmentConfig;
}

export const isPieChartConfig = (config: BaseChartConfig): config is PieChartConfig =>
  config.chartType === ChartType.Pie;
