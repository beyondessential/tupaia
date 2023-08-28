/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardItemModel as BaseDashboardItemModel,
  DashboardItemType as BaseDashboardItemType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

type DashboardItemFields = Readonly<{
  id: string;
  name: string;
  code: string;
  report_code: string;
  legacy: boolean;
  config: Record<string, unknown>;
}>;

interface DashboardItemType extends DashboardItemFields, Omit<BaseDashboardItemType, 'id'> {}

export interface DashboardItemModel
  extends Model<BaseDashboardItemModel, DashboardItemFields, DashboardItemType> {}
