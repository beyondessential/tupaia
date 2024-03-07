/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SessionRecord, SessionModel } from '@tupaia/server-boilerplate';

export class DataTrakSessionRecord extends SessionRecord {
  public static databaseRecord = 'datatrak_session';
}

export class DataTrakSessionModel extends SessionModel {
  public get DatabaseRecordClass() {
    return DataTrakSessionRecord;
  }
}
