import {
  DashboardItemModel as BaseDashboardItemModel,
  DashboardItemRecord as BaseDashboardItemRecord,
} from '@tupaia/database';
import { DashboardItem } from '@tupaia/types';
import { Model } from './types';

export interface DashboardItemRecord extends DashboardItem, BaseDashboardItemRecord {}

export interface DashboardItemModel
  extends Model<BaseDashboardItemModel, DashboardItem, DashboardItemRecord> {}
