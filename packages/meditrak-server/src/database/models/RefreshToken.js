/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  RefreshTokenType as CommonRefreshTokenType,
  RefreshTokenModel as CommonRefreshTokenModel,
} from '@tupaia/database';

class RefreshTokenType extends CommonRefreshTokenType {
  async meditrakDevice() {
    return (
      this.meditrak_device_id && this.otherModels.meditrakDevice.findById(this.meditrak_device_id)
    );
  }
}

export class RefreshTokenModel extends CommonRefreshTokenModel {
  get DatabaseTypeClass() {
    return RefreshTokenType;
  }
}
