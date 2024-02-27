/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { CssColor } from '../../../css';
import { ExportPresentationOptions } from '../common';
import { BaseChartConfig, ChartType } from './common';

export type PieChartPresentationOptions = ExportPresentationOptions & {
  [x: string]: {
    color?: CssColor;
    label?: string;
  };
};

/**
 * @description Pie Chart
 */
export type PieChartConfig = BaseChartConfig & {
  chartType: ChartType.Pie;

  /**
   * @description Common options for configuring the chart presentation
   */
  presentationOptions?: PieChartPresentationOptions;
};

export const isPieChartConfig = (config: BaseChartConfig): config is PieChartConfig =>
  config.chartType === ChartType.Pie;
