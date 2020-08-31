/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class MapOverlayType extends DatabaseType {
  static databaseType = TYPES.MAP_OVERLAY;
}

export class MapOverlayModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MapOverlayType;
  }
}
