/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable max-classes-per-file */

import moment from 'moment';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { groupEventsByPeriod } from '@tupaia/dhis-api';
import { getAllDataElementCodes } from '../../helpers';

/**
 * @abstract
 */
class DataByValueBuilder2 extends DataBuilder {
  async buildData(results) {
    const { dataElement, valuesOfInterest: valuesOfInterestSpecs } = this.config;
    const returnData = {};
    const labelByValue = {};
    valuesOfInterestSpecs.forEach(spec => {
      returnData[spec.label] = 0;
      labelByValue[spec.value] = spec.label;
    });

    results.forEach(({ dataValues }) => {
      if (!dataValues[dataElement]) {
        return;
      }

      const value = dataValues[dataElement];

      if (!labelByValue[value]) {
        // not interested in this value, ignore it
        return;
      }

      returnData[labelByValue[value]] += 1;
    });

    return [returnData];
  }
}

export class CountEventsPerPeriodByDataValueBuilder2 extends DataPerPeriodBuilder {
  async fetchResults() {
    const dataElementCodes = this.config.dataElementCodes;
    return this.fetchEvents({ useDeprecatedApi: false, dataElementCodes });
  }

  groupResultsByPeriod = groupEventsByPeriod;

  getBaseBuilderClass = () => DataByValueBuilder2;
}

export const countEventsPerPeriodByDataValue2 = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new CountEventsPerPeriodByDataValueBuilder2(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
