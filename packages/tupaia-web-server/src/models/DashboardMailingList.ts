/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardMailingListModel as BaseDashboardMailingListModel,
  DashboardMailingListType,
} from '@tupaia/database';
import { DashboardMailingList } from '@tupaia/types';
import { Model } from '@tupaia/server-boilerplate';

export interface DashboardMailingListModel
  extends Model<BaseDashboardMailingListModel, DashboardMailingList, DashboardMailingListType> {}
