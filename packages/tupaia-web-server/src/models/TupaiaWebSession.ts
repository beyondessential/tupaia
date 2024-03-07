/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SessionRecord, SessionModel } from '@tupaia/server-boilerplate';

export class TupaiaWebSessionRecord extends SessionRecord {
  public static databaseType = 'tupaia_web_session';
}

export class TupaiaWebSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return TupaiaWebSessionRecord;
  }
}
