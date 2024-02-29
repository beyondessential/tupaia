/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardRelationModel as BaseDashboardRelationModel,
  DashboardRelationType as BaseDashboardRelationType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { Dashboard, DashboardRelation, Entity, Project } from '@tupaia/types';

export interface DashboardRelationType
  extends DashboardRelation,
    Omit<BaseDashboardRelationType, 'id'> {}

export interface DashboardRelationModel
  extends Model<BaseDashboardRelationModel, DashboardRelation, DashboardRelationType> {
  findDashboardRelationsForEntityAndProject: (
    dashboardIds: Dashboard['id'][],
    entityCode: Entity['code'],
    projectCode: Project['code'],
  ) => Promise<DashboardRelation[]>;
}
