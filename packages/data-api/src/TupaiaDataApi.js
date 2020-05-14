/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import { utcMoment } from '@tupaia/utils';

import { fetchEventData, fetchAnalyticData } from './fetchData';
import { parameteriseArray, sanitizeDataValue } from './utils';

const EVENT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const DAY_PERIOD_FORMAT = 'YYYYMMDD';

export class TupaiaDataApi {
  constructor(database) {
    this.database = database;
  }

  async fetchEvents(options) {
    const results = await fetchEventData(this.database, options);
    const resultsBySurveyResponse = groupBy(results, 'surveyResponseId');
    return Object.values(resultsBySurveyResponse).map(resultsForSurveyResponse => {
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
    });
  }

  async fetchAnalytics(options) {
    const results = await fetchAnalyticData(this.database, options);
    return results.map(({ entityCode, dataElementCode, date, type, value }) => ({
      organisationUnit: entityCode,
      dataElement: dataElementCode,
      period: utcMoment(date).format(DAY_PERIOD_FORMAT), // TODO should we convert to period here or in data-broker
      value: sanitizeDataValue(value, type),
    }));
  }

  async fetchDataElements(dataElementCodes) {
    return this.database.executeSql(
      `
      SELECT code, indicator as name
      FROM question
      WHERE code IN ${parameteriseArray(dataElementCodes)};
    `,
      dataElementCodes,
    );
  }
}
