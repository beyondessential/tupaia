/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import { getPercentageCountOfValuesByCell } from './getValuesByCell';

import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfPercentagesOfValueCountsBuilder extends TableOfDataValuesBuilder {
  buildDataElementCodes() {
    const dataElementCodes = flatten(
      flatten(this.config.cells).map(cell =>
        cell.numerator.dataValues.concat(cell.denominator.dataValues),
      ),
    );
    return [...new Set(dataElementCodes)];
  }

  getCellKey(rowIndex, columnIndex) {
    return this.tableConfig.cells[rowIndex][columnIndex].key;
  }

  buildValuesByCell() {
    return getPercentageCountOfValuesByCell(flatten(this.tableConfig.cells), this.results);
  }
}

export const tableOfPercentagesOfValueCounts = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfPercentagesOfValueCountsBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.RAW,
  );
  return builder.build();
};
