/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import { utcMoment } from '@tupaia/utils';

import { fetchEventData, fetchAnalyticData } from './fetchData';
import { SqlQuery } from './SqlQuery';
import { sanitizeDataValue } from './utils';

const EVENT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const ANALYTICS_DATE_FORMAT = 'YYYY-MM-DD';

export class TupaiaDataApi {
  constructor(database) {
    this.database = database;
  }

  async fetchEvents(options) {
    const results = await fetchEventData(this.database, options);
    const resultsBySurveyResponse = groupBy(results, 'surveyResponseId');
    return Object.values(resultsBySurveyResponse)
      .map(resultsForSurveyResponse => {
        const { surveyResponseId, date, entityCode, entityName } = resultsForSurveyResponse[0];
        const dataValues = resultsForSurveyResponse.reduce(
          (values, { dataElementCode, type, value }) => ({
            ...values,
            [dataElementCode]: sanitizeDataValue(value, type),
          }),
          {},
        );
        return {
          event: surveyResponseId,
          eventDate: utcMoment(date).format(EVENT_DATE_FORMAT),
          orgUnit: entityCode,
          orgUnitName: entityName,
          dataValues,
        };
      })
      .sort((a, b) => a.eventDate > b.eventDate);
  }

  async fetchAnalytics(options) {
    const results = await fetchAnalyticData(this.database, options);
    return results.map(({ entityCode, dataElementCode, date, type, value }) => ({
      organisationUnit: entityCode,
      dataElement: dataElementCode,
      date: utcMoment(date).format(ANALYTICS_DATE_FORMAT),
      value: sanitizeDataValue(value, type),
    }));
  }

  async fetchDataElements(dataElementCodes) {
    return new SqlQuery(
      `
      SELECT code, indicator as name
      FROM question
      WHERE code IN ${SqlQuery.parameteriseArray(dataElementCodes)};
    `,
      dataElementCodes,
    ).executeOnDatabase(this.database);
  }
}
