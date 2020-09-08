/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ProjectModel } from './Project';
import { DashboardGroupModel } from './DashboardGroup';
export { Entity } from './Entity';
export { AncestorDescendantRelation } from './AncestorDescendantRelation';

export const modelClasses = {
  DashboardGroup: DashboardGroupModel,
  Project: ProjectModel,
};
