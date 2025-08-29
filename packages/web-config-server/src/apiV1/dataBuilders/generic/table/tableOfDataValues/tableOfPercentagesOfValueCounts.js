import { uniq } from 'es-toolkit';

import { getPercentageCountOfValuesByCell } from './helpers/getValuesByCell';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfPercentagesOfValueCountsBuilder extends TableOfDataValuesBuilder {
  buildDataElementCodes() {
    const dataElementCodes = this.config.cells
      .flat()
      .flatMap(cell => cell.numerator.dataValues.concat(cell.denominator.dataValues));
    return uniq(dataElementCodes);
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
