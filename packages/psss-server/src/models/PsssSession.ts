/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionModel, SessionType } from '@tupaia/server-boilerplate';

export class PsssSessionType extends SessionType {
  static databaseType = 'psss_session';
}

export class PsssSessionModel extends SessionModel {
  get DatabaseTypeClass() {
    return PsssSessionType;
  }
}
