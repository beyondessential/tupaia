/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { BaseModel } from './BaseModel';

export class Project extends BaseModel {
  static databaseType = 'project';

  static fields = [
    'id',
    'code',
    'user_groups',
    'entity_ids',
    'name',
    'description',
    'sort_order',
    'image_url',
    'logo_url',
    'dashboard_group_name',
    'default_measure',
  ];
}
