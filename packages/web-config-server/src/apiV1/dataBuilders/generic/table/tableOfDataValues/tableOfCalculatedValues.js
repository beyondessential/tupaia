/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import flattenDeep from 'lodash.flattendeep';

import { getCalculatedValuesByCell } from './getValuesByCell';
import { getDataElementsFromCalculateOperationConfig } from '/apiV1/dataBuilders/helpers';

import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfCalculatedValues extends TableOfDataValuesBuilder {
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
    return getCalculatedValuesByCell(flatten(this.tableConfig.cells), this.results, hierarchyId);
  }
}

export const tableOfCalculatedValues = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfCalculatedValues(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
