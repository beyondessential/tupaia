/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class MeditrakDeviceRecord extends DatabaseType {
  static databaseType = TYPES.MEDITRAK_DEVICE;
}

export class MeditrakDeviceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MeditrakDeviceRecord;
  }
}
