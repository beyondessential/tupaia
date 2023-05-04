/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class LandingPageProjectsType extends DatabaseType {
  static databaseType = TYPES.LANDING_PAGE_PROJECTS;
}

export class LandingPageProjectsModel extends DatabaseModel {
  get LandingPageProjectsTypeClass() {
    return LandingPageProjectsType;
  }
}
