/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionType, SessionModel } from '@tupaia/server-boilerplate';

export class LesmisSessionType extends SessionType {
  static databaseType = 'lesmis_session';
}

export class LesmisSessionModel extends SessionModel {
  get DatabaseTypeClass() {
    return LesmisSessionType;
  }
}
