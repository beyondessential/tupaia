/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseError } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class APIClientType extends DatabaseType {
  static databaseType = TYPES.API_CLIENT;
}

export class APIClientModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return APIClientType;
  }
}
