/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionType, SessionModel } from '@tupaia/server-boilerplate';

export class DatatrakSessionType extends SessionType {
  public static databaseType = 'datatrak_session';
}

export class DatatrakSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return DatatrakSessionType;
  }
}
