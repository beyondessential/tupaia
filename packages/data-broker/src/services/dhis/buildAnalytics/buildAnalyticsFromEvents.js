/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { DHIS2_RESOURCE_TYPES, PERIOD_TYPES, momentToPeriod } from '@tupaia/dhis-api';
import { utcMoment, reduceToDictionary } from '@tupaia/utils';
import { sanitizeValue } from './sanitizeValue';

class AnalyticsFromEventsBuilder {
  constructor(dhisApi) {
    this.dhisApi = dhisApi;
  }

  async translate(events) {
    const dataElements = await this.getDataElementsFromEvents(events);
    this.dataElementsByCode = keyBy(dataElements, 'code');

    return {
      results: this.transformResults(events),
      metadata: this.getMetadata(),
    };
  }

  async getDataElementsFromEvents(events) {
    const codes = events.reduce(
      (allCodes, event) => allCodes.concat(event.dataValues.map(({ dataElement }) => dataElement)),
      [],
    );

    return this.dhisApi.getRecords({
      codes,
      type: DHIS2_RESOURCE_TYPES.DATA_ELEMENT,
      fields: ['id', 'code', 'name', 'valueType'],
    });
  }

  transformResults(events) {
    return events.reduce(
      (results, event) => results.concat(this.transformResultsForEvent(event)),
      [],
    );
  }

  transformResultsForEvent(event) {
    const { orgUnit: organisationUnit, eventDate } = event;
    const period = momentToPeriod(utcMoment(eventDate), PERIOD_TYPES.DAY);

    return event.dataValues.map(({ dataElement: dataElementCode, value }) => {
      const { valueType } = this.dataElementsByCode[dataElementCode];

      return {
        dataElement: dataElementCode,
        organisationUnit,
        period,
        value: sanitizeValue(value, valueType),
      };
    });
  }

  getMetadata() {
    return { dataElementCodeToName: reduceToDictionary(this.dataElementsByCode, 'code', 'name') };
  }
}

export const buildAnalyticsFromEvents = async (dhisApi, events) => {
  const translator = new AnalyticsFromEventsBuilder(dhisApi);
  return translator.translate(events);
};
