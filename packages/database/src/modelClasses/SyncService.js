/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { generateId } from '../utilities';

class SyncServiceType extends DatabaseType {
  static databaseType = TYPES.SYNC_SERVICE;

  async log(message) {
    winston.info(`${this.code} SYNC_SERVICE_LOG: ${message}`);
    await this.otherModels.syncServiceLog.create({
      id: generateId(),
      service_code: this.code,
      service_type: this.service_type,
      log_message: message,
    });
  }
}

export class SyncServiceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SyncServiceType;
  }
}
