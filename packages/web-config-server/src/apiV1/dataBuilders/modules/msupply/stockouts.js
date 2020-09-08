/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { stripFromString } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class StockoutsDataBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes } = this.config;
    const { results, metadata } = await this.fetchAnalytics(dataElementCodes);
    const stockoutData = this.entity.isFacility()
      ? this.getStockoutsList(results, metadata)
      : await this.getStockoutsByFacility(results, metadata);

    if (stockoutData.length === 0)
      return { data: [{ value: 'Vaccine Stockouts' }, { name: 'No stockouts', value: '' }] };

    return {
      data: [{ value: 'Vaccine Stockouts' }, ...stockoutData],
    };
  }

  getStockoutsByFacility = async (results, metadata) => {
    const { dataElementCodeToName } = metadata;
    const facilities = await this.entity.getDescendantsOfType(this.models.entity.types.FACILITY);
    const facilitiesByCode = keyBy(facilities, 'code');
    const stockoutsByOrgUnit = results.reduce((stockouts, vaccine) => {
      const orgUnitName = facilitiesByCode[vaccine.organisationUnit].name;
      const stockout =
        vaccine.value === 0 &&
        stripFromString(
          dataElementCodeToName[vaccine.dataElement],
          this.config.stripFromDataElementNames,
        );

      if (stockout) {
        stockouts[orgUnitName] = [...(stockouts[orgUnitName] || []), stockout];
      }

      return stockouts;
    }, {});

    const buildStockoutString = ([facility, items]) => ({
      name: facility,
      value: items.join('\n'),
    });

    return Object.entries(stockoutsByOrgUnit).map(buildStockoutString);
  };

  getStockoutsList = (results, metadata) => {
    return results
      .filter(({ value }) => value === 0)
      .map(({ dataElement: dataElementCode }) => ({
        value: stripFromString(
          metadata.dataElementCodeToName[dataElementCode],
          this.config.stripFromDataElementNames,
        ),
      }));
  };
}

export const stockouts = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new StockoutsDataBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
