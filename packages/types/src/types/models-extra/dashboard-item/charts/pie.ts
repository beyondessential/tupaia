/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { CssColor } from '../../../css';
import { ExportPresentationOptions } from '../common';
import { BaseChartConfig, ChartType } from './common';

type PieOption = {
  color?: CssColor;
  label?: string;
};

export type PieChartPresentationOptions = ExportPresentationOptions & Record<string, PieOption>;

/**
 * @description Pie Chart
 */
export type PieChartConfig = BaseChartConfig & {
  chartType: ChartType.Pie;
  presentationOptions?: PieChartPresentationOptions;
};

export const isPieChartConfig = (config: BaseChartConfig): config is PieChartConfig =>
  config.chartType === ChartType.Pie;
