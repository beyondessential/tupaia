import { TupaiaApiClient } from '@tupaia/api-client';
import { isNullish } from '@tupaia/tsutils';
import { Country, Entity, Survey, SurveyResponse } from '@tupaia/types';
import { yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';

const requiredParamsSchema = yup.object().shape({
  ids: yup.array().of(yup.string()),
  assessorNames: yup.array().of(yup.string()),
  countryCodes: yup.array().of(yup.string()),
  surveyCodes: yup.array().of(yup.string().required()).required(),
  entityCodes: yup.array().of(yup.string()),
  startDate: yup.date(),
  endDate: yup.date(),
  outdated: yup.boolean(),
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

type StringParam = string | undefined;

type Params = {
  ids?: StringParam[];
  startDate?: Date;
  endDate?: Date;
  countryCodes?: StringParam[];
  surveyCodes: StringParam[];
  entityCodes?: StringParam[];
  assessorNames?: StringParam[];
  outdated?: boolean;
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
 * DataTableService for pulling data from central-api `surveyResponses` endpoint
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
    const filter = Object.entries(BaseFilters).reduce<
      Record<
        string,
        | boolean
        | StringParam[]
        | { comparator: '<=' | '>='; comparisonValue: Date }
        | { comparator: 'between'; comparisonValue: [Date, Date] }
      >
    >((acc, [filterKey, filterField]) => {
      const filterValue = params[filterKey as keyof Omit<Params, 'startDate' | 'endDate'>];

      if (isNullish(filterValue)) return acc;

      acc[filterField] = filterValue;
      return acc;
    }, {});

    if (params.startDate && !params.endDate) {
      // set the start date to the beginning of the day to include all responses on that day
      const startDate = new Date(params.startDate).setHours(0, 0, 0, 0);
      filter['survey_response.data_time'] = {
        comparator: '>=',
        comparisonValue: new Date(startDate),
      };
    }

    if (!params.startDate && params.endDate) {
      // set the end date to the end of the day so that it includes all responses on that day - this is because the endDate comes through as just the date, not the time, and so gets automatically set to midnight at the start of the day, so won't include responses from the full day if the date selected is in the period where UTC is behind the local time
      const endDate = new Date(params.endDate).setHours(23, 59, 59, 999);
      filter['survey_response.data_time'] = {
        comparator: '<=',
        comparisonValue: new Date(endDate),
      };
    }

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
      pageSize: 'ALL',
    });

    return results;
  }
}
