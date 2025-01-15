import {
  BarChartConfig,
  ChartData,
  ComposedChartConfig,
  DashboardItemConfig,
  GaugeChartConfig,
  LineChartConfig,
  PieChartConfig,
  PresentationOptions,
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
