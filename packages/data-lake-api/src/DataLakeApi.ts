/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import moment from 'moment';
import { getSortByKey } from '@tupaia/utils';
import { DataLakeAnalyticsFetchQuery, AnalyticsFetchOptions } from './DataLakeAnalyticsFetchQuery';
import { DataLakeEventsFetchQuery, Event, EventsFetchOptions } from './DataLakeEventsFetchQuery';
import { validateEventOptions, validateAnalyticsOptions } from './validation';
import { sanitizeAnalyticsTableValue } from './sanitizeAnalyticsTableValue';
import { sanitiseFetchDataOptions } from './sanitiseFetchDataOptions';
import { DataLakeDatabase } from './DataLakeDatabase';

const EVENT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

const buildEventDataValues = (resultsForEvent: Event[]) =>
  resultsForEvent.reduce(
    (values, { dataElementCode, type, value }) => ({
      ...values,
      [dataElementCode ?? '']: sanitizeAnalyticsTableValue(value, type),
    }),
    {},
  );

let dataLakeDatabase: DataLakeDatabase;

const getDatabase = () => {
  if (!dataLakeDatabase) {
    dataLakeDatabase = new DataLakeDatabase();
  }
  return dataLakeDatabase;
};

export class DataLakeApi {
  public async fetchEvents(optionsInput: Record<string, any>) {
    await validateEventOptions(optionsInput);
    const options = sanitiseFetchDataOptions(optionsInput as EventsFetchOptions);
    const results: Event[] = await new DataLakeEventsFetchQuery(getDatabase(), options).fetch();
    const resultsByEventId: { [key: string]: Event[] } = groupBy(results, 'eventId');
    const hasElements = options.dataElementCodes.length > 0;
    return Object.values(resultsByEventId)
      .map(resultsForEvent => {
        const [{ eventId, date, entityCode, entityName }] = resultsForEvent;
        return {
          event: eventId,
          eventDate: moment(date).format(EVENT_DATE_FORMAT),
          orgUnit: entityCode,
          orgUnitName: entityName,
          dataValues: hasElements ? buildEventDataValues(resultsForEvent) : {},
        };
      })
      .sort(getSortByKey('eventDate'));
  }

  public async fetchAnalytics(optionsInput: Record<string, any>) {
    await validateAnalyticsOptions(optionsInput);
    const options = sanitiseFetchDataOptions(optionsInput as AnalyticsFetchOptions);
    const { analytics, numAggregationsProcessed } = await new DataLakeAnalyticsFetchQuery(
      getDatabase(),
      options,
    ).fetch();
    return {
      analytics: analytics.map(({ entityCode, dataElementCode, period, type, value }) => ({
        organisationUnit: entityCode,
        dataElement: dataElementCode,
        period,
        value: sanitizeAnalyticsTableValue(value, type),
      })),
      numAggregationsProcessed,
    };
  }
}
