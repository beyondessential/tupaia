/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class Facility extends BaseModel {
  static databaseType = TYPES.FACILITY;

  static fields = ['id', 'name', 'code', 'category_code', 'type_name', 'type'];
  get organisationUnitCode() {
    return this.code;
  }

  get categoryCode() {
    return this.category_code;
  }
}
