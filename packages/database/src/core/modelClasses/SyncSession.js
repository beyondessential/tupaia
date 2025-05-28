import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SyncSessionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_SESSION;

  async markAsStartedAt(tick) {
    return this.model.update({ id: this.id }, { started_at_tick: tick });
  }

  async markErrored(error) {
    const errors = this.errors || [];
    this.errors = [...errors, error];
    this.completedAt = new Date();
    await this.save();
  }
}

export class SyncSessionModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return SyncSessionRecord;
  }

  async markSessionErrored(id, error) {
    const session = await this.findById(id);
    await session?.markErrored(error);
  }

  async addDebugInfo(id, info) {
    const session = await this.findById(id);
    session.debugInfo = { ...session.debugInfo, ...info };
    await session.save();
  }
}
