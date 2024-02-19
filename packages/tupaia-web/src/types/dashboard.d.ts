/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardItem as BaseDashboardItem,
  KeysToCamelCase,
  TupaiaWebDashboardsRequest,
} from '@tupaia/types';

export type DashboardItem = KeysToCamelCase<BaseDashboardItem>;

export type DashboardName = DashboardItem['dashboardName'];

export type Dashboard = TupaiaWebDashboardsRequest.ResBody[0];
