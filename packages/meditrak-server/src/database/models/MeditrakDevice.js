/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';

export class MeditrakDeviceType extends DatabaseType {
  static databaseType = TYPES.MEDITRAK_DEVICE;
}

export class MeditrakDeviceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MeditrakDeviceType;
  }
}
