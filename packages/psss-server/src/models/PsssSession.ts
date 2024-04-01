/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionModel, SessionRecord } from '@tupaia/server-boilerplate';

export class PsssSessionRecord extends SessionRecord {
  public static databaseRecord = 'psss_session';
}

export class PsssSessionModel extends SessionModel {
  public get DatabaseRecordClass() {
    return PsssSessionRecord;
  }
}
