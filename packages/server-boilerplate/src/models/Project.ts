/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { ProjectModel as BaseProjectModel, ProjectType as BaseProjectType } from '@tupaia/database';
import { Project } from '@tupaia/types';
import { Model } from './types';

export interface ProjectType extends Project, BaseProjectType {}

export interface ProjectModel extends Model<BaseProjectModel, Project, ProjectType> {
  getAccessibleProjects: (accessPolicy: AccessPolicy) => Promise<ProjectType[]>;
}
