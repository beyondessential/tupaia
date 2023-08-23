/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SessionType, SessionModel } from '@tupaia/server-boilerplate';

export class DataTrakSessionType extends SessionType {
  public static databaseType = 'datatrak_session';
}

export class DataTrakSessionModel extends SessionModel {
  public get DatabaseTypeClass() {
    return DataTrakSessionType;
  }
}
