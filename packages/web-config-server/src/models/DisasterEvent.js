/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class DisasterEvent extends BaseModel {
  static databaseType = TYPES.DISASTER_EVENT;

  static fields = ['id', 'date', 'type', 'organisationUnitCode', 'disasterId'];
}
