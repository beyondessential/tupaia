/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ProjectModel as BaseProjectModel, ProjectType as BaseProjectType } from '@tupaia/database';
import { Model } from './types';

export interface ProjectFields {
  readonly code: string;
  readonly entity_hierarchy_id: string;
}

export interface ProjectType extends BaseProjectType, ProjectFields {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProjectModel extends Model<BaseProjectModel, ProjectFields, ProjectType> {}
