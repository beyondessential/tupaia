/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import moment from 'moment';
import { TupaiaDatabase } from '@tupaia/database';
import { getSortByKey, DEFAULT_BINARY_OPTIONS, yup } from '@tupaia/utils';
import { valuesIn } from 'lodash';
import { SqlQuery } from './SqlQuery';
import { AnalyticsFetchOptions, AnalyticsFetchQuery } from './AnalyticsFetchQuery';
import { EventsFetchQuery, EventAnswer, EventsFetchOptions } from './EventsFetchQuery';
import { sanitizeMetadataValue, sanitizeAnalyticsTableValue, isDefined } from './utils';
import { validateEventOptions, validateAnalyticsOptions } from './validation';
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

  constructor(database: TupaiaDatabase) {
    this.database = database;
  }

  async fetchEvents(optionsInput: Record<string, unknown>) {
    await validateEventOptions(optionsInput);
    const options = sanitiseFetchDataOptions(optionsInput as EventsFetchOptions);
    const results = await new EventsFetchQuery(this.database, options).fetch();
    const answersByEventId = groupBy(results, 'eventId');
    const hasElements = options.dataElementCodes.length > 0;
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

  async fetchAnalytics(optionsInput: Record<string, unknown>) {
    await validateAnalyticsOptions(optionsInput);
    const options = sanitiseFetchDataOptions(optionsInput as AnalyticsFetchOptions);
    const { analytics, numAggregationsProcessed } = await new AnalyticsFetchQuery(
      this.database,
      options,
    ).fetch();

    const analyticsWithEntityType = analytics.filter(({ type }) => type === 'entity');
    if (analyticsWithEntityType.length > 0) {
      const entityIds = new Set<string>();
      analyticsWithEntityType
        .map(({ value }) => value)
        .forEach(id => {
          entityIds.add(id);
        });
      const entityIdsToCodes = await new SqlQuery<{ code: string; id: string }[]>(
        `
       SELECT code, id
       FROM entity
       WHERE id IN ${SqlQuery.array(Array.from(entityIds))};
     `,
        Array.from(entityIds),
      ).executeOnDatabase(this.database);

      for (const { code, id } of entityIdsToCodes) {
        const changeArray = analytics
          .map(({ value }, index) => [value, index])
          .filter(([value]) => value === id);
        changeArray.forEach(([, analyticsIndex]) => {
          analytics[Number(analyticsIndex)].value = code;
        });
      }
    }
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

  async fetchDataElements(dataElementCodes?: unknown, options: { includeOptions?: boolean } = {}) {
    const validationErrorMessage = 'Please provide an array of data element codes';
    const dataElementCodesValidator = yup
      .array()
      .of(yup.string().required())
      .required(validationErrorMessage)
      .typeError(validationErrorMessage);

    const validatedDataElementCodes = dataElementCodesValidator.validateSync(dataElementCodes);
    const { includeOptions = true } = options;

    const sqlQuery = new SqlQuery<
      { code: string; name: string; options: string[]; option_set_id: string; type: string }[]
    >(
      `
       SELECT code, name, options, option_set_id, type
       FROM question
       WHERE code IN ${SqlQuery.array(validatedDataElementCodes)};
     `,
      validatedDataElementCodes,
    );

    return this.fetchDataElementsMetadataFromSqlQuery(sqlQuery, includeOptions);
  }

  async fetchDataGroup(
    dataGroupCode?: string,
    dataElementCodes?: string[],
    options: { includeOptions?: boolean } = {},
  ) {
    const { includeOptions = true } = options;
    if (!dataGroupCode) {
      throw new Error('Please provide a data group code');
    }

    const dataGroups = await new SqlQuery<{ code: string; name: string }[]>(
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

    let dataGroupMetadata: { code: string; name: string; dataElements?: any[] } = {
      ...dataGroup,
    };

    // dataElementCodes metadata can be optional
    if (dataElementCodes && Array.isArray(dataElementCodes)) {
      const sqlQuery = new SqlQuery<
        {
          code: string;
          name: string;
          text: string;
          options: string[];
          option_set_id: string;
          type: string;
        }[]
      >(
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

  private async fetchDataElementsMetadataFromSqlQuery(
    sqlQuery: SqlQuery<{ option_set_id: string | undefined; type: string; options: string[] }[]>,
    includeOptions: boolean,
  ) {
    const dataElementsMetadata = await sqlQuery.executeOnDatabase(this.database);

    // includeOptions = true, should also fetch metadata for options from both question.options and question.option_set_id
    if (includeOptions) {
      // Get all possible option_set_ids from questions
      const optionSetIds = [
        ...new Set(dataElementsMetadata.map(d => d.option_set_id).filter(isDefined)),
      ];
      // Get all the options from the option sets and grouped by set ids.
      const optionsGroupedBySetId = await this.getOptionsGroupedBySetId(optionSetIds);

      return dataElementsMetadata.map(
        ({ options, type, option_set_id: optionSetId, ...restOfMetadata }) => {
          // In reality, the options can only come from either question.options or question.option_set_id
          const allOptions = [
            ...options,
            ...(optionSetId ? optionsGroupedBySetId[optionSetId] : []),
          ];
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

  private async getOptionsGroupedBySetId(optionSetIds: string[]) {
    if (optionSetIds.length === 0) {
      return {};
    }

    const options = await new SqlQuery<
      { value: string; label: string | undefined; option_set_id: string }[]
    >(
      `
       SELECT option.value, option.label, option.option_set_id
       FROM option
       WHERE option.option_set_id IN ${SqlQuery.array(optionSetIds)}
       `,
      optionSetIds,
    ).executeOnDatabase(this.database);

    return groupBy(options, 'option_set_id');
  }

  private buildOptionsMetadata = (
    options: (string | { value: string; label: string | undefined })[] = [],
    type: string,
  ) => {
    const optionList = options.length === 0 && type === 'Binary' ? DEFAULT_BINARY_OPTIONS : options;

    if (!optionList.length) {
      return undefined;
    }

    const optionsMetadata: Record<string, string> = {};
    const optionsObjectValidator = yup.object({
      value: yup.string().required(),
      label: yup.string(),
    });

    optionList.forEach(option => {
      if (typeof option !== 'string') {
        const { value, label } = option;
        optionsMetadata[sanitizeMetadataValue(value, type)] = label || value;
        return;
      }

      try {
        // options coming from question.options are JSON format strings
        // options coming from option_set are actual JSON objects
        const optionObject = optionsObjectValidator.validateSync(JSON.parse(option));
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
