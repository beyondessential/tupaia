import {
  DashboardMailingListModel as BaseDashboardMailingListModel,
  DashboardMailingListRecord as BaseDashboardMailingListRecord,
} from '@tupaia/database';
import { DashboardMailingList } from '../models';
import { Model } from './types';

export interface DashboardMailingListRecord
  extends DashboardMailingList,
    BaseDashboardMailingListRecord {}

export interface DashboardMailingListModel
  extends Model<BaseDashboardMailingListModel, DashboardMailingList, DashboardMailingListRecord> {}
