/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/
import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class Survey extends BaseModel {
  static databaseType = TYPES.SURVEY;

  static fields = [
    'id',
    'name',
    'code',
    'permission_group_id',
    'country_ids',
    'can_repeat',
    'survey_group_id',
    'integration_metadata',
  ];
}
