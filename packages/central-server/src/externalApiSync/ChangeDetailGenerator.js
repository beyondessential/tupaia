import { SyncQueueChangesManipulator } from './SyncQueueChangesManipulator';

export class ChangeDetailGenerator extends SyncQueueChangesManipulator {
  /**
   * Generate the `details` column for an array of update changes. Should return an array of details
   * strings in the same order as the incoming updateChanges array
   * @abstract
   * @param {Object[]} updateChanges
   */
  async generateDetails(updateChanges) {}
}
