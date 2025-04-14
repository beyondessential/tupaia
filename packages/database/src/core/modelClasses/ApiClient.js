import { DatabaseError } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class ApiClientRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.API_CLIENT;

  async getUser() {
    const userId = this.user_account_id;

    // If the api client is not associated with a user, e.g. meditrak api client,
    // the consuming function should auth the user separately
    if (!userId) return null;

    const user = await this.otherModels.user.findOne({ id: userId });
    if (!user) {
      // This isn't an authentication error - the client has provided the correct
      // name and key, but the api client record has an invalid user ID attached!
      throw new DatabaseError('API user does not exist');
    }

    return user;
  }
}

export class ApiClientModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return ApiClientRecord;
  }
}
