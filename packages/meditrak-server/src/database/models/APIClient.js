/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';

class APIClientType extends DatabaseType {
  static databaseType = TYPES.API_CLIENT;
}

export class APIClientModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return APIClientType;
  }
}
