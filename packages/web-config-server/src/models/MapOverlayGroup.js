/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class MapOverlayGroup extends BaseModel {
  static databaseType = TYPES.MAP_OVERLAY_GROUP;

  static fields = ['id', 'name', 'code', 'top_level'];
}
