/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { MatrixConfig } from './matricies';
import type { ComponentConfig } from './components';
import type {
  BarChartConfig,
  ComposedChartConfig,
  GaugeChartConfig,
  LineChartConfig,
  PieChartConfig,
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
} from './views';

/**
 * The master list of viz types.
 * Please also keep ../../utils/vizTypes up to date when making changes
 */
export type DashboardItemConfig =
  | GaugeChartConfig
  | ComposedChartConfig
  | BarChartConfig
  | PieChartConfig
  | LineChartConfig
  | ComponentConfig
  | MatrixConfig
  | ListViewConfig
  | SingleValueViewConfig
  | MultiPhotographViewConfig
  | MultiSingleValueViewConfig
  | SingleDownloadLinkViewConfig
  | MultiValueRowViewConfig
  | ColorListViewConfig
  | DataDownloadViewConfig
  | SingleDateViewConfig
  | MultiValueViewConfig;
