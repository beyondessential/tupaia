import { SessionRecord, SessionModel } from '@tupaia/server-boilerplate';

export class LesmisSessionRecord extends SessionRecord {
  public static databaseRecord = 'lesmis_session';
}

export class LesmisSessionModel extends SessionModel {
  public get DatabaseRecordClass() {
    return LesmisSessionRecord;
  }
}
