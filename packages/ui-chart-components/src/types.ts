/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  BarChartConfig,
  CartesianChartConfig,
  ChartData,
  ComposedChartConfig,
  GaugeChartConfig,
  LineChartConfig,
  PieChartConfig,
} from '@tupaia/types';

export type TableAccessor = Function | string;

export interface LooseObject {
  [k: string]: any;
}

/**
 * This is a tupaia specific setting rather than a recharts config option.
 */
export type LegendPosition = 'top' | 'bottom';

/**
 * View Content is the data structure that is passed to the chart components. It contains both the
 * data and the configuration for the chart. It only exists on the front end.
 */
export type ViewContentT<T> = T & {
  colorPalette?: string;
  data: ChartData[];
  chartConfig: T;
};

export type BarChartViewContent = ViewContentT<BarChartConfig>;
export type LineChartViewContent = ViewContentT<LineChartConfig>;
export type PieChartViewContent = ViewContentT<PieChartConfig>;
export type CartesianViewContentT = ViewContentT<CartesianChartConfig>;
export type GaugeChartViewContent = ViewContentT<GaugeChartConfig>;
export type ComposedChartViewContent = ViewContentT<ComposedChartConfig>;

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
export type ViewContent =
  | LineChartViewContent
  | PieChartViewContent
  | GaugeChartViewContent
  | BarChartViewContent
  | ComposedChartViewContent;
