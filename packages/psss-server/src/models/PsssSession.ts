/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionModel, SessionRecord } from '@tupaia/server-boilerplate';

export class PsssSessionRecord extends SessionRecord {
  public static databaseType = 'psss_session';
}

export class PsssSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return PsssSessionRecord;
  }
}
