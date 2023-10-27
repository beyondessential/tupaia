/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { yup } from '@tupaia/utils';
import { Country, Entity, Survey, SurveyResponse } from '@tupaia/types';
import { DataTableService } from '../DataTableService';
import { getDefaultEndDate, getDefaultStartDate } from './utils';

const requiredParamsSchema = yup.object().shape({
  ids: yup.array().of(yup.string()).default([]),
  assessorNames: yup.array().of(yup.string()).default([]),
  countryCodes: yup.array().of(yup.string()).default([]),
  surveyCodes: yup.array().of(yup.string()).default([]),
  entityCodes: yup.array().of(yup.string()).default([]),
  startDate: yup.date().default(getDefaultStartDate),
  endDate: yup.date().default(getDefaultEndDate),
  outdated: yup.boolean().default(false),
});

const configSchema = yup.object();

type SurveyResponseDataTableServiceContext = {
  apiClient: TupaiaApiClient;
};

enum BaseFilters {
  countryCodes = 'country.code',
  surveyCodes = 'survey.code',
  entityCodes = 'entity.code',
  assessorNames = 'survey_response.assessor_name',
  ids = 'survey_response.id',
  outdated = 'survey_response.outdated',
}

type Params = {
  ids: string[];
  startDate?: Date;
  endDate?: Date;
  countryCodes: string[];
  surveyCodes: string[];
  entityCodes: string[];
  assessorNames: string[];
  outdated: boolean;
};

enum ResponseColumns {
  surveyResponseId = 'survey_response.id',
  surveyResponseAssessorName = 'survey_response.assessor_name',
  surveyResponseDataTime = 'survey_response.data_time',
  surveyResponseOutdated = 'survey_response.outdated',
  surveyId = 'survey.id',
  surveyName = 'survey.name',
  surveyCode = 'survey.code',
  entityName = 'entity.name',
  countryName = 'country.name',
}

type SurveyResponseDataTableServiceResponse = {
  [ResponseColumns.countryName]: Country['name'];
  [ResponseColumns.entityName]: Entity['name'];
  [ResponseColumns.surveyId]: Survey['id'];
  [ResponseColumns.surveyName]: Survey['name'];
  [ResponseColumns.surveyCode]: Survey['code'];
  [ResponseColumns.surveyResponseId]: SurveyResponse['id'];
  [ResponseColumns.surveyResponseAssessorName]: SurveyResponse['assessor_name'];
  [ResponseColumns.surveyResponseDataTime]: SurveyResponse['data_time'];
  [ResponseColumns.surveyResponseOutdated]: SurveyResponse['outdated'];
};

/**
 * DataTableService for pulling data from aggregator's fetchDataGroup() endpoint
 */
export class SurveyResponseDataTableService extends DataTableService<
  SurveyResponseDataTableServiceContext,
  typeof requiredParamsSchema,
  typeof configSchema,
  SurveyResponseDataTableServiceResponse
> {
  protected supportsAdditionalParams = false;

  public constructor(context: SurveyResponseDataTableServiceContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected getFilter(params: Params) {
    const filter = Object.entries(BaseFilters).reduce((acc, [filterKey, filterField]) => {
      const filterValue = params[filterKey as keyof Omit<Params, 'startDate' | 'endDate'>];

      if (filterValue === undefined || filterValue === null) return acc;

      if (Array.isArray(filterValue) && filterValue.length === 0) return acc;

      return {
        ...acc,
        [filterField]: filterValue,
      };
    }, {} as Record<string, any>);

    if (params.startDate && params.endDate) {
      // Set the start date to the beginning of the day and the end date to the end of the day
      const startDate = new Date(params.startDate).setHours(0, 0, 0, 0);
      const endDate = new Date(params.endDate).setHours(23, 59, 59, 999);
      filter['survey_response.data_time'] = {
        comparator: 'between',
        comparisonValue: [new Date(startDate), new Date(endDate)],
      };
    }

    return filter;
  }

  protected async pullData(params: Params) {
    const filter = this.getFilter(params);

    const results = await this.ctx.apiClient.central.fetchResources('surveyResponses', {
      filter,
      columns: Object.values(ResponseColumns),
      sort: [`${ResponseColumns.surveyResponseDataTime} DESC`],
    });

    return results;
  }
}
