/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SessionType, SessionModel } from '@tupaia/server-boilerplate';

export class TupaiaWebSessionType extends SessionType {
  public static databaseType = 'tupaia_web_session';
}

export class TupaiaWebSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return TupaiaWebSessionType;
  }
}
