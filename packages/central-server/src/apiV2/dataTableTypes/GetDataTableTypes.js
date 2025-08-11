import { DataTableType } from '@tupaia/types';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertVizBuilderAccess,
  hasBESAdminAccess,
} from '../../permissions';
import { GETHandler } from '../GETHandler';

/**
 * Custom implementation required for this route as there is no corresponding
 * DatabaseModel for DataTableType. It's an enum, not a table.
 */
export class GetDataTableTypes extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, assertVizBuilderAccess]),
    );
  }

  /** @returns {Promise<DataTableType[]>} */
  async getDataTableTypes() {
    const dataTableTypes = await this.models.dataTable.getDataTableTypes();

    if (hasBESAdminAccess(this.accessPolicy)) return dataTableTypes;

    // Only SQL data tables are relevant to Viz Builder Users
    return dataTableTypes.filter(type => type === DataTableType.sql);
  }

  async getDbQueryOptions() {
    const { limit, page } = this.getPaginationParameters();
    const offset = limit * page;

    return { limit, offset };
  }

  /**
   * @param {*} recordId A data table type (the enum value).
   * @returns {Promise<{ id: DataTableType, type: DataTableType }>}
   */
  async findSingleRecord(recordId) {
    const dataTableTypes = await this.getDataTableTypes();
    const dataTableType = dataTableTypes.find(type => type === recordId);
    if (dataTableType === undefined) return undefined;

    return { id: dataTableType, type: dataTableType };
  }

  /** @returns {Promise<{ id: DataTableType, type: DataTableType }[]>} */
  async findRecords(_criteria, options) {
    const { limit, offset } = options;
    const dataTableTypes = await this.getDataTableTypes();

    if (offset) dataTableTypes.splice(0, offset);
    if (limit) dataTableTypes.splice(limit);

    return dataTableTypes.map(type => ({ id: type, type }));
  }

  /** @returns {Promise<number>} */
  async countRecords() {
    return hasBESAdminAccess(this.accessPolicy)
      ? await this.models.dataTable.getDataTableTypeCount()
      : // Model’s getDataTableTypeCount doesn’t support WHERE clause; just fetch and count
        (await this.getDataTableTypes()).length;
  }
}
