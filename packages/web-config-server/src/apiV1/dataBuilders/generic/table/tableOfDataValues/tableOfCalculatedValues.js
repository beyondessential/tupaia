/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import { getCalculatedValuesByCell } from './getValuesByCell';

import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfCalculatedValues extends TableOfDataValuesBuilder {
  buildDataElementCodes() {
    const dataElementCodes = flatten(
      flatten(this.config.cells).map(cell =>
        cell.firstOperand.dataValues.concat(cell.secondOperand.dataValues),
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
