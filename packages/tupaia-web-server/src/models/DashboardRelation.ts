/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardRelationModel as BaseDashboardRelationModel,
  DashboardRelationType as BaseDashboardRelationType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

type DashboardRelationFields = Readonly<{
  id: string;
  dashboard_id: string;
  child_id: string;
  entity_types: string[];
  project_codes: string[];
  permission_groups: string[];
  sort_order: number;
}>;

export interface DashboardRelationType
  extends DashboardRelationFields,
    Omit<BaseDashboardRelationType, 'id'> {}

export interface DashboardRelationModel
  extends Model<BaseDashboardRelationModel, DashboardRelationFields, DashboardRelationType> {}
