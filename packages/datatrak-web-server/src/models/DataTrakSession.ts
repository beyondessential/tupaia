/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SessionRecord, SessionModel } from '@tupaia/server-boilerplate';

export class DataTrakSessionRecord extends SessionRecord {
  public static databaseType = 'datatrak_session';
}

export class DataTrakSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return DataTrakSessionRecord;
  }
}
