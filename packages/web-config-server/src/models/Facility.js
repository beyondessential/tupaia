/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { BaseModel } from './BaseModel';

export class Facility extends BaseModel {
  static databaseType = 'clinic';

  static fields = ['id', 'name', 'code', 'category_code', 'type_name'];
  get organisationUnitCode() {
    return this.code;
  }

  get categoryCode() {
    return this.category_code;
  }

  get type() {
    return this.type_name;
  }
}
