/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import dataBroker from '@tupaia/data-broker';
import { Pusher } from '../Pusher';

export class DataPusher extends Pusher {
  checkExistsOnDhis2 = syncLogRecord =>
    syncLogRecord &&
    (syncLogRecord.imported || syncLogRecord.updated) &&
    !syncLogRecord.deleted &&
    syncLogRecord.data;

  getDhisApiInstance(syncLogRecord) {
    const { serverName } = this.extractDataFromSyncLog(syncLogRecord);
    return dataBroker.getDhisApiInstance({ serverName });
  }
}
