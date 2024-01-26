/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  BarChartConfig,
  CartesianChartConfig,
  ChartConfig,
  ChartData,
  ChartType,
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
 * This is a tupaia specific setting rather than a recharts config option.
 */
export type LegendPosition = 'top' | 'bottom';

/**
 * @description  This is the shape of the ViewContent object before it has been parsed by parseChartConfig
 */
export type UnparsedViewContentT<T> = T & {
  colorPalette?: string;
  data: ChartData[];
};

/**
 * @description View Content is the data structure that is passed to the chart components. It contains both the
 * data and the configuration for the chart. It only exists on the front end. It includes the outcome of parseChartConfig
 */
export type ParsedViewContentT<T> = T & {
  colorPalette?: string;
  data: ChartData[];
  /**
   * @description parseChartConfig merges the existing chartConfig with the overall chart config
   */
  chartConfig: T & ChartConfig;
};

export type ParsedBarChartViewContent = ParsedViewContentT<BarChartConfig>;
export type ParsedLineChartViewContent = ParsedViewContentT<LineChartConfig>;
export type ParsedPieChartViewContent = ParsedViewContentT<PieChartConfig>;
export type ParsedCartesianViewContentT = ParsedViewContentT<CartesianChartConfig>;
export type ParsedGaugeChartViewContent = ParsedViewContentT<GaugeChartConfig>;
export type ParsedComposedChartViewContent = ParsedViewContentT<ComposedChartConfig>;

/**
 * @description A union of all the different cartesian chart types' view content
 */
export type ParsedCartesianChartViewContent =
  | ParsedComposedChartViewContent
  | ParsedBarChartViewContent
  | ParsedLineChartViewContent;

/**
 * @description A union of all the different chart types' view content
 */
export type ParsedViewContent =
  | ParsedLineChartViewContent
  | ParsedPieChartViewContent
  | ParsedGaugeChartViewContent
  | ParsedBarChartViewContent
  | ParsedComposedChartViewContent;

export type UnparsedBarChartViewContent = UnparsedViewContentT<BarChartConfig>;
type UnparsedLineChartViewContent = UnparsedViewContentT<LineChartConfig>;
type UnparsedPieChartViewContent = UnparsedViewContentT<PieChartConfig>;
type UnparsedGaugeChartViewContent = UnparsedViewContentT<GaugeChartConfig>;
type UnparsedComposedChartViewContent = UnparsedViewContentT<ComposedChartConfig>;

/**
 * @description A union of all the different chart types' view content
 */
export type UnparsedChartViewContent =
  | UnparsedLineChartViewContent
  | UnparsedPieChartViewContent
  | UnparsedGaugeChartViewContent
  | UnparsedBarChartViewContent
  | UnparsedComposedChartViewContent;

export type UnparsedViewViewContent = Omit<UnparsedViewContentT<ViewConfig>, 'data'> & {
  data?: ViewDataItem[];
};

export type ExportViewContent = UnparsedViewViewContent | UnparsedChartViewContent;
