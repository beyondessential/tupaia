/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import moment from 'moment';
import { TupaiaDatabase } from '@tupaia/database';
import { getSortByKey } from '@tupaia/utils';
import { AnalyticsFetchQuery } from './AnalyticsFetchQuery';
import { EventsFetchQuery, EventAnswer } from './EventsFetchQuery';
import { sanitizeAnalyticsTableValue } from './utils';
import { eventOptionsValidator, analyticsOptionsValidator } from './validators';
import { sanitiseFetchDataOptions } from './sanitiseFetchDataOptions';

const EVENT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

const buildDataValuesFromAnswers = (answersForEvent: EventAnswer[]) =>
  answersForEvent.reduce<Record<string, string | number>>(
    (values, { dataElementCode, type, value }) => ({
      ...values,
      [dataElementCode]: sanitizeAnalyticsTableValue(value, type),
    }),
    {},
  );

export class TupaiaDataApi {
  private readonly database: TupaiaDatabase;

  public constructor(database: TupaiaDatabase) {
    this.database = database;
  }

  public async fetchEvents(optionsInput: Record<string, unknown>) {
    const validatedOptions = eventOptionsValidator.validateSync(optionsInput);
    const sanitizedOptions = sanitiseFetchDataOptions(validatedOptions);
    const results = await new EventsFetchQuery(this.database, sanitizedOptions).fetch();
    const answersByEventId = groupBy(results, 'eventId');
    const hasElements = sanitizedOptions.dataElementCodes.length > 0;
    return Object.values(answersByEventId)
      .map(resultsForEvent => {
        const [{ eventId, date, entityCode, entityName }] = resultsForEvent;
        return {
          event: eventId,
          eventDate: moment(date).format(EVENT_DATE_FORMAT),
          orgUnit: entityCode,
          orgUnitName: entityName,
          dataValues: hasElements ? buildDataValuesFromAnswers(resultsForEvent) : {},
        };
      })
      .sort(getSortByKey('eventDate'));
  }

  public async fetchAnalytics(optionsInput: Record<string, unknown>) {
    const validatedOptions = analyticsOptionsValidator.validateSync(optionsInput);
    const sanitizedOptions = sanitiseFetchDataOptions(validatedOptions);
    const { analytics, numAggregationsProcessed } = await new AnalyticsFetchQuery(
      this.database,
      sanitizedOptions,
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
