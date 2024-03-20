/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardItemModel as BaseDashboardItemModel,
  DashboardItemRecord as BaseDashboardItemRecord,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { DashboardItem } from '@tupaia/types';

interface DashboardItemRecord extends DashboardItem, Omit<BaseDashboardItemRecord, 'id'> {}

export interface DashboardItemModel
  extends Model<BaseDashboardItemModel, DashboardItem, DashboardItemRecord> {}
