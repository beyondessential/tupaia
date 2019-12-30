/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';

class InstallIdType extends DatabaseType {
  static databaseType = TYPES.INSTALL_ID;
}

export class InstallIdModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return InstallIdType;
  }

  async createForUser(userId, installId, platform) {
    const existing = await this.findOne({ install_id: installId });

    if (existing && existing.user_id !== userId) {
      existing.user_id = userId;
      await existing.save();
      return existing;
    }

    return this.create({
      user_id: userId,
      install_id: installId,
      platform,
    });
  }
}
