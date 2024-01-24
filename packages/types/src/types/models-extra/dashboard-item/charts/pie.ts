/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { CssColor } from '../../../css';
import { ExportPresentationOptions } from '../common';
import { BaseChartConfig } from './common';

export type PieChartPresentationOptions = Record<
  string,
  {
    color?: CssColor;
  } & ExportPresentationOptions
>;

/**
 * @description Pie Chart
 */
export type PieChartConfig = BaseChartConfig & {
  chartType: 'pie';
  presentationOptions?: PieChartPresentationOptions;
};
