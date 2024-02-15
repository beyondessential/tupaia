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

/**
 * The shape of the `ViewContent` object before it has been parsed by {@link parseChartConfig}.
 */
export type ViewContentT<T> = T & {
  colorPalette?: string;
  data: ChartData[];
};

export type BarChartViewContent = ViewContentT<BarChartConfig>;
export type LineChartViewContent = ViewContentT<LineChartConfig>;
export type PieChartViewContent = ViewContentT<PieChartConfig>;
export type GaugeChartViewContent = ViewContentT<GaugeChartConfig>;
export type ComposedChartViewContent = ViewContentT<ComposedChartConfig>;

/**
 * @description A union of all the different chart types' view content
 */
export type ViewContent =
  | LineChartViewContent
  | PieChartViewContent
  | GaugeChartViewContent
  | BarChartViewContent
  | ComposedChartViewContent;
/**
 * @description A union of all the different cartesian chart types' view content
 */
export type CartesianChartViewContent =
  | ComposedChartViewContent
  | BarChartViewContent
  | LineChartViewContent;
/**
 * @description A union of all the different chart types' view content
 */
export type ChartViewContent =
  | LineChartViewContent
  | PieChartViewContent
  | GaugeChartViewContent
  | BarChartViewContent
  | ComposedChartViewContent;

export type ViewViewContent = Omit<ViewContentT<ViewConfig>, 'data'> & {
  data?: ViewDataItem[];
};

export type ExportViewContent = ViewViewContent | ChartViewContent;
