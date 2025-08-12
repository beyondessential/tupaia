import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const DATA_TABLE_TYPES = {
  INTERNAL: 'internal',
};

export class DataTableRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_TABLE;
}

export class DataTableModel extends DatabaseModel {
  static DATA_TABLE_TYPES = DATA_TABLE_TYPES;

  get DatabaseRecordClass() {
    return DataTableRecord;
  }

  /** @returns {Promise<import('@tupaia/types').DataTableType[]>} */
  async getDataTableTypes() {
    const dataTableTypes = await this.database.executeSql(
      'SELECT unnest(enum_range(NULL::data_table_type)) AS type;',
    );
    return dataTableTypes.map(({ type }) => type);
  }

  /** @returns {Promise<number>} */
  async getDataTableTypeCount() {
    const [{ cardinality }] = await this.database.executeSql(
      'SELECT cardinality(enum_range(NULL::data_table_type));',
    );
    return cardinality;
  }
}
