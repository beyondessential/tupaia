import {
  DashboardRelationModel as BaseDashboardRelationModel,
  DashboardRelationRecord as BaseDashboardRelationRecord,
} from '@tupaia/database';
import { Dashboard, DashboardRelation, Entity, Project } from '@tupaia/types';
import { Model } from './types';

export interface DashboardRelationRecord extends DashboardRelation, BaseDashboardRelationRecord {}

export interface DashboardRelationModel
  extends Model<BaseDashboardRelationModel, DashboardRelation, DashboardRelationRecord> {
  findDashboardRelationsForEntityAndProject: (
    dashboardIds: Dashboard['id'][],
    entityCode: Entity['code'],
    projectCode: Project['code'],
  ) => Promise<DashboardRelation[]>;
}
