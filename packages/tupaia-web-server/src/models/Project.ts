/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ProjectModel as BaseProjectModel, ProjectType } from '@tupaia/database';
import { Project } from '@tupaia/types';
import { Model } from '@tupaia/server-boilerplate';

export interface ProjectModel extends Model<BaseProjectModel, Project, ProjectType> {}
