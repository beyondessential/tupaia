/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/
import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class Country extends BaseModel {
  static databaseType = TYPES.COUNTRY;

  static fields = ['id', 'name', 'code'];
}
