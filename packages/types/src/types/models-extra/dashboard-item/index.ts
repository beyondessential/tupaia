/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type {
  MatrixConfig,
  PresentationOptionCondition,
  PresentationOptions,
  ConditionValue,
  ConditionType,
  RangePresentationOptions,
  ConditionalPresentationOptions,
} from './matricies';
import type { ComponentConfig } from './components';
import type {
  BarChartConfig,
  ComposedChartConfig,
  GaugeChartConfig,
  LineChartConfig,
  PieChartConfig,
  ChartConfig,
} from './charts';
import type {
  ColorListViewConfig,
  DataDownloadViewConfig,
  ListViewConfig,
  MultiPhotographViewConfig,
  MultiSingleValueViewConfig,
  MultiValueRowViewConfig,
  MultiValueViewConfig,
  SingleDateViewConfig,
  SingleDownloadLinkViewConfig,
  SingleValueViewConfig,
  ViewConfig,
} from './views';

export type {
  BarChartConfig,
  ComposedChartConfig,
  GaugeChartConfig,
  LineChartConfig,
  PieChartConfig,
  BaseChartConfig,
  CartesianChartConfig,
} from './charts';
/**
 * The master list of viz types.
 * Please also keep ../../utils/vizTypes up to date when making changes
 */
export type DashboardItemConfig =
  | ChartConfig
  | ComponentConfig
  | MatrixConfig
  | ListViewConfig
  | ViewConfig
  | MultiPhotographViewConfig
  | ColorListViewConfig
  | DataDownloadViewConfig;

export type { ValueType } from './common';
export type {
  MatrixConfig,
  PresentationOptionCondition,
  PresentationOptions,
  ConditionValue,
  ConditionType,
  RangePresentationOptions,
  ConditionalPresentationOptions,
  ViewConfig,
  DataDownloadViewConfig,
  ListViewConfig,
  MultiPhotographViewConfig,
  MultiSingleValueViewConfig,
  MultiValueRowViewConfig,
  MultiValueViewConfig,
  SingleDateViewConfig,
  SingleDownloadLinkViewConfig,
  SingleValueViewConfig,
  ChartConfig,
};
