import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '../DatabaseModel';

export class MaterializedViewLogDatabaseModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  async fetchSchema() {
    this.schemaPromise = await super.fetchSchema();

    if ('m_row$' in this.schemaPromise) {
      delete this.schemaPromise.m_row$; // Remove the m_row$ field from the schema notation
    }

    return this.schemaPromise;
  }
}
