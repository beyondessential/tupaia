import flatten from 'lodash.flatten';
import flattenDeep from 'lodash.flattendeep';

import { getCalculatedValuesByCell } from './helpers/getValuesByCell';
import { getDataElementsFromCalculateOperationConfig } from '/apiV1/dataBuilders/helpers';
import { ORG_UNIT_COLUMNS_KEYS_SET, NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfCalculatedValuesBuilder extends TableOfDataValuesBuilder {
  buildDataElementCodes() {
    const dataElementCodes = flattenDeep(
      this.config.cells.map(row =>
        row.map(cell =>
          typeof cell === 'string' ? cell : getDataElementsFromCalculateOperationConfig(cell),
        ),
      ),
    );
    return [...new Set(dataElementCodes)];
  }

  getCellKey(rowIndex, columnIndex) {
    return (
      this.tableConfig.cells[rowIndex][columnIndex].key ??
      this.tableConfig.cells[rowIndex][columnIndex]
    );
  }

  async buildValuesByCell() {
    const hierarchyId = await this.fetchEntityHierarchyId();
    const noDataValue = this.config.noDataValue ?? NO_DATA_AVAILABLE;

    // Add `key` to each cell if columns are programmatically generated
    const filterKeys = ['dataElement'];
    if (ORG_UNIT_COLUMNS_KEYS_SET.includes(this.config.columns)) {
      this.columns = await this.buildColumns();
      this.tableConfig.cells.forEach((cell, rowKey) => {
        this.tableConfig.cells[rowKey] = this.columns.map(({ key: columnKey, title }) => ({
          key: `row${rowKey}_${columnKey}`,
          organisationUnit: title,
          ...cell[0],
        }));
      });
      filterKeys.push('organisationUnit');
    }

    return getCalculatedValuesByCell(this.models, flatten(this.tableConfig.cells), this.results, {
      hierarchyId,
      noDataValue,
      filterKeys,
    });
  }
}

export const tableOfCalculatedValues = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfCalculatedValuesBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
