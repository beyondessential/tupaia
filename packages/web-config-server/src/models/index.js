/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { ProjectModel } from './Project';
import { DashboardGroupModel } from './DashboardGroup';
export { UserSession } from './UserSession';
export { Facility } from './Facility';
export { EntityRelation } from './EntityRelation';
export { Entity } from './Entity';
export { AncestorDescendantRelation } from './AncestorDescendantRelation';

export const modelClasses = {
  DashboardGroup: DashboardGroupModel,
  Project: ProjectModel,
};
