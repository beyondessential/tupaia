import { AccessPolicy } from '@tupaia/access-policy';
import { Project } from '@tupaia/types';
import {
  ProjectModel as BaseProjectModel,
  ProjectRecord as BaseProjectRecord,
} from '@tupaia/database';
import { EntityRecord } from './Entity';
import { Model } from './types';

export interface ProjectRecord extends Project, BaseProjectRecord {
  getRootEntity: () => Promise<EntityRecord>;
}

export interface ProjectModel extends Model<BaseProjectModel, Project, ProjectRecord> {
  getAccessibleProjects: (accessPolicy: AccessPolicy) => Promise<ProjectRecord[]>;
}
