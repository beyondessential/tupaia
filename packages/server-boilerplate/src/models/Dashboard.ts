/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardModel as BaseDashboardModel,
  DashboardRecord as BaseDashboardRecord,
} from '@tupaia/database';
import { Dashboard } from '@tupaia/types';
import { Model } from './types';

export interface DashboardRecord extends Dashboard, BaseDashboardRecord {}

export interface DashboardModel extends Model<BaseDashboardModel, Dashboard, DashboardRecord> {}
