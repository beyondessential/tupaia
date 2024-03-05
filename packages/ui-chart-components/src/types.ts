/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import {
  BarChartConfig,
  ChartData,
  ComposedChartConfig,
  GaugeChartConfig,
  LineChartConfig,
  PieChartConfig,
  ViewConfig,
  ViewDataItem,
} from '@tupaia/types';

export type TableAccessor = Function | string;

export interface LooseObject {
  [k: string]: any;
}

/**
 * A Tupaia-specific setting, not a Recharts config option.
 */
export type LegendPosition = 'top' | 'bottom';

export type CartesianChartConfig = BarChartConfig | LineChartConfig | ComposedChartConfig;
