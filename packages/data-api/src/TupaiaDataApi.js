/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import moment from 'moment';
import { getSortByKey, DEFAULT_BINARY_OPTIONS } from '@tupaia/utils';
import { SqlQuery } from './SqlQuery';
import { AnalyticsFetchQuery } from './AnalyticsFetchQuery';
import { EventsFetchQuery } from './EventsFetchQuery';
import { sanitizeMetadataValue, sanitizeAnalyticsTableValue } from './utils';
import { validateEventOptions, validateAnalyticsOptions } from './validation';
import { sanitiseFetchDataOptions } from './sanitiseFetchDataOptions';

const EVENT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

const buildEventDataValues = resultsForEvent =>
  resultsForEvent.reduce(
    (values, { dataElementCode, type, value }) => ({
      ...values,
      [dataElementCode]: sanitizeAnalyticsTableValue(value, type),
    }),
    {},
  );

export class TupaiaDataApi {
  constructor(database) {
    this.database = database;
  }

  async fetchEvents(optionsInput) {
    await validateEventOptions(optionsInput);
    const options = sanitiseFetchDataOptions(optionsInput);
    const results = await new EventsFetchQuery(this.database, options).fetch();
    const resultsByEventId = groupBy(results, 'eventId');
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

  async fetchAnalytics(optionsInput) {
    await validateAnalyticsOptions(optionsInput);
    const options = sanitiseFetchDataOptions(optionsInput);
    const { analytics, numAggregationsProcessed } = await new AnalyticsFetchQuery(
      this.database,
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

  async fetchDataElements(dataElementCodes, options = {}) {
    const { includeOptions = true } = options;
    if (!dataElementCodes || !Array.isArray(dataElementCodes)) {
      throw new Error('Please provide an array of data element codes');
    }
    const sqlQuery = new SqlQuery(
      `
       SELECT code, name, options, option_set_id, type
       FROM question
       WHERE code IN ${SqlQuery.array(dataElementCodes)};
     `,
      dataElementCodes,
    );

    return this.fetchDataElementsMetadataFromSqlQuery(sqlQuery, includeOptions);
  }

  async fetchDataGroup(dataGroupCode, dataElementCodes, options = {}) {
    const { includeOptions = true } = options;
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
         SELECT question.code, question.name, question.text, question.options, question.option_set_id, question.type
         FROM question
         JOIN survey_screen_component on question.id = survey_screen_component.question_id
         JOIN survey_screen on survey_screen.id = survey_screen_component.screen_id
         JOIN survey on survey_screen.survey_id = survey.id
         WHERE survey.code = '${dataGroupCode}'
         AND question.code IN ${SqlQuery.array(dataElementCodes)}
         ORDER BY survey_screen.screen_number, survey_screen_component.component_number;
       `,
        dataElementCodes,
      );

      const dataElementsMetadata = await this.fetchDataElementsMetadataFromSqlQuery(
        sqlQuery,
        includeOptions,
      );

      dataGroupMetadata = {
        ...dataGroupMetadata,
        dataElements: dataElementsMetadata,
      };
    }

    return dataGroupMetadata;
  }

  async fetchDataElementsMetadataFromSqlQuery(sqlQuery, includeOptions) {
    const dataElementsMetadata = await sqlQuery.executeOnDatabase(this.database);

    // includeOptions = true, should also fetch metadata for options from both question.options and question.option_set_id
    if (includeOptions) {
      // Get all possible option_set_ids from questions
      const optionSetIds = [
        ...new Set(dataElementsMetadata.filter(d => !!d.option_set_id).map(d => d.option_set_id)),
      ];
      // Get all the options from the option sets and grouped by set ids.
      const optionsGroupedBySetId = await this.getOptionsGroupedBySetId(optionSetIds);

      return dataElementsMetadata.map(
        ({ options, type, option_set_id: optionSetId, ...restOfMetadata }) => {
          // In reality, the options can only come from either question.options or question.option_set_id
          const allOptions = [...options, ...(optionsGroupedBySetId[optionSetId] || [])];
          return {
            options: this.buildOptionsMetadata(allOptions, type),
            ...restOfMetadata,
          };
        },
      );
    }

    // includeOptions = false, return basic data elements metadata
    return dataElementsMetadata.map(
      ({ options, type, option_set_id: optionSetId, ...restOfMetadata }) => ({
        ...restOfMetadata,
      }),
    );
  }

  async getOptionsGroupedBySetId(optionSetIds) {
    if (!optionSetIds || !optionSetIds.length) {
      return {};
    }

    const options = await new SqlQuery(
      `
       SELECT option.value, option.label, option.option_set_id
       FROM option
       WHERE option.option_set_id IN ${SqlQuery.array(optionSetIds)}
       `,
      optionSetIds,
    ).executeOnDatabase(this.database);

    return groupBy(options, 'option_set_id');
  }

  buildOptionsMetadata = (options = [], type) => {
    const optionList = options.length === 0 && type === 'Binary' ? DEFAULT_BINARY_OPTIONS : options;

    if (!optionList.length) {
      return undefined;
    }

    const optionsMetadata = {};

    optionList.forEach(option => {
      try {
        // options coming from question.options are JSON format strings
        // options coming from option_set are actual JSON objects
        const optionObject = typeof option === 'string' ? JSON.parse(option) : option;
        const { value, label } = optionObject;
        optionsMetadata[sanitizeMetadataValue(value, type)] = label || value;
      } catch (error) {
        // Exception is thrown when option is a plain string
        optionsMetadata[sanitizeMetadataValue(option, type)] = option;
      }
    });

    return optionsMetadata;
  };
}
