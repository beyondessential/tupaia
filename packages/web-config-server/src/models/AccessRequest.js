/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class AccessRequest extends BaseModel {
  static databaseType = TYPES.ACCESS_REQUEST;

  static fields = [
    'id',
    'user_id',
    'entity_id',
    'message',
    'project_id',
    'permission_group_id',
    'approved',
    'created_time',
    'processed_by',
    'note',
    'processed_date',
  ];
}
