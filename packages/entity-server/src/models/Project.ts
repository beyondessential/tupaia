/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import {
  ProjectModel as BaseProjectModel,
  ProjectRecord as BaseProjectRecord,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

type ProjectFields = Readonly<{
  id: string;
  code: string;
  name: string;
  entity_id: string;
  entity_hierarchy_id: string;
  permission_groups: string[];
}>;

interface ProjectRecord extends ProjectFields, Omit<BaseProjectRecord, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface ProjectModel extends Model<BaseProjectModel, ProjectFields, ProjectRecord> {
  getAccessibleProjects: (accessPolicy: AccessPolicy) => Promise<ProjectRecord[]>;
}
