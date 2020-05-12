/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class RefreshTokenType extends DatabaseType {
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
