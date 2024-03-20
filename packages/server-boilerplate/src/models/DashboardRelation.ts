/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardRelationModel as BaseDashboardRelationModel,
  DashboardRelationRecord as BaseDashboardRelationRecord,
} from '@tupaia/database';
import { Dashboard, DashboardRelation, Entity, Project } from '@tupaia/types';
import { Model } from './types';

export interface DashboardRelationRecord
  extends DashboardRelation,
    Omit<BaseDashboardRelationRecord, 'id'> {}

export interface DashboardRelationModel
  extends Model<BaseDashboardRelationModel, DashboardRelation, DashboardRelationRecord> {
  findDashboardRelationsForEntityAndProject: (
    dashboardIds: Dashboard['id'][],
    entityCode: Entity['code'],
    projectCode: Project['code'],
  ) => Promise<DashboardRelation[]>;
}
