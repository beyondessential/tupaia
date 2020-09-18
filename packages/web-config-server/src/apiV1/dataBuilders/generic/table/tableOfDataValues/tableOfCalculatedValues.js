/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import flattenDeep from 'lodash.flattendeep';

import { getCalculatedValuesByCell } from './getValuesByCell';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfCalculatedValues extends TableOfDataValuesBuilder {
  buildDataElementCodes() {
    const dataElementCodes = flattenDeep(
      this.config.cells.map(row =>
        row.map(cell =>
          typeof cell === 'string'
            ? cell
            : cell.dataElement ||
              (cell.operands && cell.operands.map(operand => operand.dataValues)) ||
              (cell.dataElementToString && Object.keys(cell.dataElementToString)),
        ),
      ),
    );
    return [...new Set(dataElementCodes)];
  }

  getCellKey(rowIndex, columnIndex) {
    return (
      this.tableConfig.cells[rowIndex][columnIndex].key ||
      this.tableConfig.cells[rowIndex][columnIndex]
    );
  }

  buildValuesByCell() {
    return getCalculatedValuesByCell(flatten(this.tableConfig.cells), this.results);
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
