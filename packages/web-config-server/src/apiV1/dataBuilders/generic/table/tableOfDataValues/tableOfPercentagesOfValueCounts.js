/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { getPercentageCountOfValuesByCell } from './getValuesByCell';

import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfPercentagesOfValueCountsBuilder extends TableOfDataValuesBuilder {
  buildDataElementCodes() {
    const dataElementCodes = this.config.cells
      .flat()
      .map(cell => cell.numerator.dataValues.concat(cell.denominator.dataValues))
      .flat();
    return [...new Set(dataElementCodes)];
  }

  getCellKey(rowIndex, columnIndex) {
    return this.tableConfig.cells[rowIndex][columnIndex].key;
  }

  buildValuesByCell() {
    return getPercentageCountOfValuesByCell(this.tableConfig.cells.flat(), this.results);
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
