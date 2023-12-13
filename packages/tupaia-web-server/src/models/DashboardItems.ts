/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardItemModel as BaseDashboardItemModel,
  DashboardItemType as BaseDashboardItemType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { DashboardItem } from '@tupaia/types';

interface DashboardItemType extends DashboardItem, Omit<BaseDashboardItemType, 'id'> {}

export interface DashboardItemModel
  extends Model<BaseDashboardItemModel, DashboardItem, DashboardItemType> {}
