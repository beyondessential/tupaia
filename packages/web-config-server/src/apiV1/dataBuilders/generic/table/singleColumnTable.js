/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { stripFromStart } from '@tupaia/utils';
import { getDataElementsFromCodes } from '/apiV1/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class SingleColumnTableDataBuilder extends DataBuilder {
  async build() {
    const { columnTitle, shouldShowTotalsRow, dataElementCodes, stripFromRowNames } = this.config;

    // Get the columns
    const columns = [{ key: columnTitle, title: columnTitle }];

    // Prepare an object to hold the total of each column so sums can be performed during row data gathering
    let total = 0;

    // Get the details of the data elements so we know the row names
    const dataElements = await getDataElementsFromCodes(this.dhisApi, dataElementCodes, true);

    // Get the rows and data
    const rows = [];
    const rowIndices = {};
    dataElementCodes.forEach((dataElementCode, index) => {
      const { id: dataElementId, name } = dataElements[dataElementCode];
      rows[index] = {
        dataElement: stripFromStart(name, stripFromRowNames),
      };
      rowIndices[dataElementId] = index;
    });
    const results = await this.getResults(dataElements);
    results.forEach(({ dataElement: dataElementId, value }) => {
      rows[rowIndices[dataElementId]][columnTitle] = value;
      total += value;
    });

    if (shouldShowTotalsRow) {
      rows.push({ dataElement: 'Total', [columnTitle]: total });
    }

    const responseObject = {
      columns,
      rows,
    };
    return responseObject;
  }

  async getResults(dataElements) {
    if (this.isEventBased()) {
      return this.getEventResults(dataElements);
    }

    return this.getDataValueResults();
  }

  async getEventResults(dataElements) {
    const { dataElementCodes } = this.config;
    const {
      results,
      metadata: { dataElementIdToCode },
    } = await this.getEventAnalytics({ dataElementCodes });

    return results.map(({ dataElement: dataElementId, value }) => {
      const dataElementCode = dataElementIdToCode[dataElementId];
      const formattedValue =
        dataElements[dataElementCode] && dataElements[dataElementCode].options
          ? dataElements[dataElementCode].options[value]
          : value;
      return { dataElement: dataElementId, value: formattedValue };
    });
  }

  async getDataValueResults() {
    const { dataElementCodes } = this.config;
    const { results } = await this.getDataValueAnalytics({ dataElementCodes });

    return results;
  }
}

export const singleColumnTable = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SingleColumnTableDataBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    AGGREGATION_TYPES.SUM_MOST_RECENT_PER_FACILITY,
  );
  const responseObject = await builder.build();

  return responseObject;
};
