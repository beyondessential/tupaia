/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class ProjectType extends DatabaseType {
  static databaseType = TYPES.PROJECT;

  async permissionGroups() {
    return this.otherModels.permissionGroup.find({ name: this.user_groups });
  }
}

export class ProjectModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return ProjectType;
  }
}
