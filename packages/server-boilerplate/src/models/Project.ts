/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { Project } from '@tupaia/types';
import {
  ProjectModel as BaseProjectModel,
  ProjectRecord as BaseProjectRecord,
} from '@tupaia/database';
import { Model } from './types';

type ProjectFields = Readonly<Project>;

interface ProjectRecord extends ProjectFields, Omit<BaseProjectRecord, 'id'> {} // Omit base `id: any` type as it comes from ProjectFields

export interface ProjectModel extends Model<BaseProjectModel, ProjectFields, ProjectRecord> {
  getAccessibleProjects: (accessPolicy: AccessPolicy) => Promise<ProjectRecord[]>;
}
