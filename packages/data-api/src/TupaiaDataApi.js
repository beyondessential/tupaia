/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import moment from 'moment';
import { getSortByKey } from '@tupaia/utils';
import { fetchEventData, fetchAnalyticData } from './fetchData';
import { SqlQuery } from './SqlQuery';
import { sanitizeDataValue } from './utils';
import { validateEventOptions, validateAnalyticsOptions } from './validation';

const EVENT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const ANALYTICS_DATE_FORMAT = 'YYYY-MM-DD';

export class TupaiaDataApi {
  constructor(database) {
    this.database = database;
  }

  async fetchEvents(options) {
    await validateEventOptions(options);
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
          eventDate: moment(date).format(EVENT_DATE_FORMAT),
          orgUnit: entityCode,
          orgUnitName: entityName,
          dataValues,
        };
      })
      .sort(getSortByKey('eventDate'));
  }

  async fetchAnalytics(options) {
    await validateAnalyticsOptions(options);
    const results = await fetchAnalyticData(this.database, options);
    return results.map(({ entityCode, dataElementCode, date, type, value }) => ({
      organisationUnit: entityCode,
      dataElement: dataElementCode,
      date: moment(date).format(ANALYTICS_DATE_FORMAT),
      value: sanitizeDataValue(value, type),
    }));
  }

  async fetchDataElements(dataElementCodes) {
    if (!dataElementCodes || !Array.isArray(dataElementCodes)) {
      throw new Error('Please provide an array of data element codes');
    }
    return new SqlQuery(
      `
      SELECT code, name
      FROM question
      WHERE code IN ${SqlQuery.parameteriseArray(dataElementCodes)};
    `,
      dataElementCodes,
    ).executeOnDatabase(this.database);
  }

  async fetchDataGroup(dataGroupCode, dataElementCodes) {
    if (!dataGroupCode) {
      throw new Error('Please provide a data group code');
    }

    const dataGroups = await new SqlQuery(
      `
      SELECT code, name
      FROM survey 
      WHERE survey.code = '${dataGroupCode}'
    `,
    ).executeOnDatabase(this.database);

    const dataGroup = dataGroups[0];

    if (!dataGroup) {
      throw new Error(`Cannot find Survey: ${dataGroupCode}`);
    }

    let dataGroupMetadata = {
      ...dataGroup,
    };

    // dataElementCodes metadata can be optional
    if (dataElementCodes && Array.isArray(dataElementCodes)) {
      const sqlQuery = await new SqlQuery(
        `
        SELECT question.code, question.name, question.text
        FROM question 
        JOIN survey_screen_component on question.id = survey_screen_component.question_id 
        JOIN survey_screen on survey_screen.id = survey_screen_component.screen_id
        JOIN survey on survey_screen.survey_id = survey.id 
        WHERE survey.code = '${dataGroupCode}'
        AND question.code IN ${SqlQuery.parameteriseArray(dataElementCodes)}
      `,
        dataElementCodes,
      );

      sqlQuery.orderBy('survey_screen.screen_number, survey_screen_component.component_number');

      const dataElementsMetadata = await sqlQuery.executeOnDatabase(this.database);

      dataGroupMetadata = {
        ...dataGroupMetadata,
        dataElements: dataElementsMetadata,
      };
    }

    return dataGroupMetadata;
  }
}
