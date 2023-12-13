/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardModel as BaseDashboardModel,
  DashboardType as BaseDashboardType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

type DashboardFields = Readonly<{
  id: string;
  code: string;
  name: string;
  root_entity_code: string;
  sort_order: number | null;
}>;

interface DashboardType extends DashboardFields, Omit<BaseDashboardType, 'id'> {}

export interface DashboardModel extends Model<BaseDashboardModel, DashboardFields, DashboardType> {}
