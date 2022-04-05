/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionModel, SessionType } from '@tupaia/server-boilerplate';

export class PsssSessionType extends SessionType {
  public static databaseType = 'psss_session';
}

export class PsssSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return PsssSessionType;
  }
}
