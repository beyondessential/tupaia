/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardRelationModel as BaseDashboardRelationModel,
  DashboardRelationType as BaseDashboardRelationType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { DashboardRelation } from '@tupaia/types';

type DashboardRelationFields = Readonly<
  Omit<DashboardRelation, 'entity_types' | 'project_codes' | 'permission_groups'> & {
    entity_types: string[];
    project_codes: string[];
    permission_groups: string[];
  }
>;

export interface DashboardRelationType
  extends DashboardRelationFields,
    Omit<BaseDashboardRelationType, 'id'> {}

export interface DashboardRelationModel
  extends Model<BaseDashboardRelationModel, DashboardRelationFields, DashboardRelationType> {}
