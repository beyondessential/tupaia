/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { utcMoment, reduceToDictionary, PERIOD_TYPES, momentToPeriod } from '@tupaia/utils';
import { sanitizeValue } from './sanitizeValue';

class AnalyticsFromEventsBuilder {
  async translate(events, dataElements) {
    this.dataElementsByCode = keyBy(dataElements, 'code');

    return {
      results: this.transformResults(events),
      metadata: this.getMetadata(),
    };
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

    const results = [];
    event.dataValues.forEach(({ dataElement: dataElementCode, value }) => {
      if (!this.dataElementsByCode[dataElementCode]) {
        return;
      }

      const { valueType } = this.dataElementsByCode[dataElementCode];
      results.push({
        dataElement: dataElementCode,
        organisationUnit,
        period,
        value: sanitizeValue(value, valueType),
      });
    });

    return results;
  }

  getMetadata() {
    return { dataElementCodeToName: reduceToDictionary(this.dataElementsByCode, 'code', 'name') };
  }
}

export const buildAnalyticsFromEvents = async (events, dataElements) =>
  new AnalyticsFromEventsBuilder().translate(events, dataElements);
