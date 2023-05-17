/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SessionType, SessionModel } from '@tupaia/server-boilerplate';

export class UserSessionType extends SessionType {
  public static databaseType = 'userSession';
}

export class UserSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return UserSessionType;
  }
}
