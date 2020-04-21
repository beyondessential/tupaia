/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class RefreshTokenType extends DatabaseType {
  static databaseType = TYPES.REFRESH_TOKEN;

  async meditrakDevice() {
    return (
      this.meditrak_device_id && this.otherModels.meditrakDevice.findById(this.meditrak_device_id)
    );
  }
}

export class RefreshTokenModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return RefreshTokenType;
  }
}
