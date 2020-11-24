/* eslint-disable max-classes-per-file */
/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType } from '@tupaia/database';
import { AccessPolicy } from '@tupaia/access-policy';

export class PsssSessionType extends DatabaseType {
  static databaseType = 'psss_session';

  get accessPolicy() {
    return new AccessPolicy(this.access_policy);
  }
}

export class PsssSessionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return PsssSessionType;
  }
}
