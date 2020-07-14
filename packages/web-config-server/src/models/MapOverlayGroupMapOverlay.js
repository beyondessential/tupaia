/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class MapOverlayGroupMapOverlay extends BaseModel {
  static databaseType = TYPES.MAP_OVERLAY_GROUP_MAP_OVERLAY;

  static fields = ['id', 'map_overlay_group_id', 'child_id', 'child_type'];
}
