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
  notifiers = [onUpsertSanitizeConfig];

  get DatabaseTypeClass() {
    return MeditrakDeviceType;
  }
}

const onUpsertSanitizeConfig = async (change, record, models) => {
  if (change.type === 'delete') {
    return;
  }

  const meditrakDevice = await models.meditrakDevice.findById(record.id);
  if (meditrakDevice.app_version && meditrakDevice.config.unsupportedTypes) {
    delete meditrakDevice.config.unsupportedTypes;
    await meditrakDevice.save();
  }
};
