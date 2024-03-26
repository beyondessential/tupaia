/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardMailingListModel as BaseDashboardMailingListModel,
  DashboardMailingListRecord as BaseDashboardMailingListRecord,
} from '@tupaia/database';
import { DashboardMailingList } from '@tupaia/types';
import { Model } from './types';

export interface DashboardMailingListRecord
  extends DashboardMailingList,
    BaseDashboardMailingListRecord {}

export interface DashboardMailingListModel
  extends Model<BaseDashboardMailingListModel, DashboardMailingList, DashboardMailingListRecord> {}
