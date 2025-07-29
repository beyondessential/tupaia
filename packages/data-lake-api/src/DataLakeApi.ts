import { groupBy } from 'es-toolkit/compat';

import moment from 'moment';
import { getSortByKey } from '@tupaia/utils';
import { DataLakeAnalyticsFetchQuery } from './DataLakeAnalyticsFetchQuery';
import { DataLakeEventsFetchQuery, Event } from './DataLakeEventsFetchQuery';
import { analyticsOptionsValidator, eventOptionsValidator } from './validators';
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

export const getDatabase = () => {
  if (!dataLakeDatabase) {
    dataLakeDatabase = new DataLakeDatabase();
  }
  return dataLakeDatabase;
};

export class DataLakeApi {
  public async fetchEvents(optionsInput: Record<string, any>) {
    const validatedOptions = eventOptionsValidator.validateSync(optionsInput);
    const sanitizedOptions = sanitiseFetchDataOptions(validatedOptions);
    const results: Event[] = await new DataLakeEventsFetchQuery(
      getDatabase(),
      sanitizedOptions,
    ).fetch();
    const resultsByEventId: { [key: string]: Event[] } = groupBy(results, 'eventId');
    const hasElements = sanitizedOptions.dataElementCodes.length > 0;
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
    const validatedOptions = analyticsOptionsValidator.validateSync(optionsInput);
    const options = sanitiseFetchDataOptions(validatedOptions);
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
