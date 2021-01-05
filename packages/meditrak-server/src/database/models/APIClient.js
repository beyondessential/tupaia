/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class APIClientType extends DatabaseType {
  static databaseType = TYPES.API_CLIENT;
}

export class APIClientModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return APIClientType;
  }
}
