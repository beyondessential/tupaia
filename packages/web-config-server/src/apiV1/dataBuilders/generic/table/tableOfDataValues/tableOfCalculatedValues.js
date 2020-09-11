/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import flattenDeep from 'lodash.flattendeep';

import { getCalculatedValuesByCell } from './getValuesByCell';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfCalculatedValuesBuilder extends TableOfDataValuesBuilder {
  buildDataElementCodes() {
    const dataElementCodes = flattenDeep(
      this.config.cells.map(row =>
        row.map(cell => cell.operands.map(operand => operand.dataValues)),
      ),
    );
    return [...new Set(dataElementCodes)];
  }

  getCellKey(rowIndex, columnIndex) {
    return this.tableConfig.cells[rowIndex][columnIndex].key;
  }

  buildValuesByCell() {
    return getCalculatedValuesByCell(flatten(this.tableConfig.cells), this.results);
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
