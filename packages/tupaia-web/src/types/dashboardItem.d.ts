/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  ChartConfig,
  ComponentConfig,
  MatrixConfig,
  MultiValueRowViewConfig,
  MultiValueViewConfig,
  ViewConfig,
  DashboardItem as BaseDashboardItem,
} from '@tupaia/types';
import { KeysToCamelCase } from './helpers';

type DashboardItemConfigPresentationOptions =
  | MultiValueViewConfig['presentationOptions']
  | MultiValueRowViewConfig['presentationOptions']
  | MatrixConfig['presentationOptions']
  | ChartConfig['presentationOptions'];

type BaseConfig = Omit<
  BaseDashboardItemConfig,
  'viewType' | 'presentationOptions' | 'componentName'
>;

export type DashboardItemConfig = BaseConfig & {
  viewType?: ViewConfig['viewType'];
  presentationOptions?: DashboardItemConfigPresentationOptions;
  componentName?: ComponentConfig['componentName'];
};

export type DashboardItem = Omit<KeysToCamelCase<BaseDashboardItem>, 'config'> & {
  config: DashboardItemConfig;
};

export type DashboardName = DashboardItem['dashboardName'];
