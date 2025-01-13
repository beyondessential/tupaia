import { EntityPusher } from './EntityPusher';

/**
 * Handles push attempts of non existing records
 * by providing suitable error messages and responses
 */
export class NonExistingRecordPusher extends EntityPusher {
  async createOrUpdate() {
    // Entity does not exist
    try {
      return this.fetchEntity();
    } catch (error) {
      return {
        errors: [error.message],
        wasSuccessful: false,
      };
    }
  }

  async delete() {
    // Record was not synced in DHIS, skip deletion
    try {
      return this.fetchDataFromSyncLog();
    } catch (error) {
      return {
        errors: [error.message],
        wasSuccessful: true,
      };
    }
  }
}
