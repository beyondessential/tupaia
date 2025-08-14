import { ensure } from '@tupaia/tsutils';
import { DataTableType } from '@tupaia/types';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const DATA_TABLE_TYPES = {
  INTERNAL: 'internal',
};

export class DataTableRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_TABLE;

  async getExternalDatabaseConnection() {
    if (this.type !== DataTableType.sql) return null;
    const code = ensure(
      this.config.externalDatabaseConnectionCode,
      `Data table ${this.id}’s config is missing required property externalDatabaseConnectionCode`,
    );
    return ensure(
      await this.otherModels.externalDatabaseConnection.findOne({ code }),
      `Couldn’t find external database connection for data table ${this.id} (expected external database connection with code ${code})`,
    );
  }
}

export class DataTableModel extends DatabaseModel {
  static DATA_TABLE_TYPES = DATA_TABLE_TYPES;

  get DatabaseRecordClass() {
    return DataTableRecord;
  }

  /** @returns {Promise<DataTableType[]>} */
  async getDataTableTypes() {
    const dataTableTypes = await this.database.executeSql(
      'SELECT unnest(enum_range(NULL::data_table_type)) AS type;',
    );
    // ORDER BY has no effect (enum order is preserved), so sort here
    return dataTableTypes.map(({ type }) => type).sort();
  }

  /** @returns {Promise<number>} */
  async getDataTableTypeCount() {
    const [{ cardinality }] = await this.database.executeSql(
      'SELECT cardinality(enum_range(NULL::data_table_type));',
    );
    return cardinality;
  }
}
