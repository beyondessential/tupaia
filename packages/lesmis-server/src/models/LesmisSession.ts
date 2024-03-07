/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionRecord, SessionModel } from '@tupaia/server-boilerplate';

export class LesmisSessionRecord extends SessionRecord {
  public static databaseType = 'lesmis_session';
}

export class LesmisSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return LesmisSessionRecord;
  }
}
