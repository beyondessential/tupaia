/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { BaseModel } from './BaseModel';

export class DisasterEvent extends BaseModel {
  static databaseType = 'disasterEvent';

  static fields = ['id', 'date', 'type', 'organisationUnitCode', 'disasterId'];
}
