/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type {
  MatrixConfig,
  PresentationOptionCondition,
  MatrixPresentationOptions,
  ConditionsObject,
  ConditionValue,
  ConditionType,
  RangePresentationOptions,
  ConditionalPresentationOptions,
  PresentationOptionRange,
} from './matricies';
import type { ComponentConfig } from './components';
import type { ChartConfig, ChartPresentationOptions } from './charts';
import type {
  DataDownloadViewConfig,
  MultiPhotographViewConfig,
  MultiSingleValueViewConfig,
  MultiValueRowViewConfig,
  MultiValueViewConfig,
  SingleDateViewConfig,
  SingleDownloadLinkViewConfig,
  SingleValueViewConfig,
  ViewConfig,
  ViewPresentationOptions,
} from './views';

export { ChartType } from './charts';
export {
  isBarChartConfig,
  isChartConfig,
  isComposedChartConfig,
  isGaugeChartConfig,
  isLineChartConfig,
  isPieChartConfig,
  BarChartConfig,
  ComposedChartConfig,
  GaugeChartConfig,
  LineChartConfig,
  PieChartConfig,
  BaseChartConfig,
  CartesianChartConfig,
  PieChartPresentationOptions,
  PieChartSegmentConfig,
  BarChartPresentationOptions,
  CartesianChartPresentationOptions,
  ReferenceLinesConfig,
  ChartConfigT,
  ChartConfigObject,
  LineChartChartConfig,
} from './charts';
/**
 * The master list of viz types.
 * Please also keep ../../utils/vizTypes up to date when making changes
 */
export type DashboardItemConfig = ChartConfig | ComponentConfig | MatrixConfig | ViewConfig;

export { ValueType, ExportPresentationOptions, DatePickerOffsetSpec } from './common';
export type {
  MatrixConfig,
  PresentationOptionCondition,
  MatrixPresentationOptions,
  ConditionsObject,
  ConditionValue,
  ConditionType,
  RangePresentationOptions,
  ConditionalPresentationOptions,
  ViewConfig,
  DataDownloadViewConfig,
  MultiPhotographViewConfig,
  MultiSingleValueViewConfig,
  MultiValueRowViewConfig,
  MultiValueViewConfig,
  SingleDateViewConfig,
  SingleDownloadLinkViewConfig,
  SingleValueViewConfig,
  ChartConfig,
  ViewPresentationOptions,
  ChartPresentationOptions,
  ComponentConfig,
  PresentationOptionRange,
};

export type PresentationOptions =
  | MatrixPresentationOptions
  | ViewPresentationOptions
  | ChartPresentationOptions;
