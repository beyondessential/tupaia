/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class LandingPageType extends DatabaseType {
  static databaseType = TYPES.LANDING_PAGE;
}

export class LandingPageModel extends DatabaseModel {
  get LandingPageTypeClass() {
    return LandingPageType;
  }
}
