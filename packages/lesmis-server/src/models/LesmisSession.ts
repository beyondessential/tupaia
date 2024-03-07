/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionRecord, SessionModel } from '@tupaia/server-boilerplate';

export class LesmisSessionRecord extends SessionRecord {
  public static databaseRecord = 'lesmis_session';
}

export class LesmisSessionModel extends SessionModel {
  public get DatabaseRecordClass() {
    return LesmisSessionRecord;
  }
}
