import camelcaseKeys from 'camelcase-keys';
import { Request } from 'express';
import { sortBy } from 'es-toolkit/compat';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyRequest } from '@tupaia/types';

type SingleSurveyResponse = DatatrakWebSurveyRequest.ResBody;

// Todo: consolidate types between SurveysRoute and SingleSurveyRoute
export type SurveysRequest = Request<
  DatatrakWebSurveyRequest.Params,
  SingleSurveyResponse[],
  DatatrakWebSurveyRequest.ReqBody,
  DatatrakWebSurveyRequest.ReqQuery
>;

type SearchCondition =
  | {
      comparator: string;
      comparisonValue: string;
    }
  | { sql: string };

export class SurveysRoute extends Route<SurveysRequest> {
  public async buildResponse() {
    const { ctx, query = {}, models } = this.req;
    const { fields = [], projectId, countryCode, searchTerm } = query;
    const country = await models.country.findOne({ code: countryCode });

    const queryUrl = countryCode ? `countries/${country.id}/surveys` : 'surveys';

    const filter: Record<string, string | SearchCondition> = {};

    if (projectId) {
      filter.project_id = projectId;
    }

    if (searchTerm) {
      filter.name = { comparator: 'ilike', comparisonValue: `%${searchTerm}%` };
    }

    const surveys = await ctx.services.central.fetchResources(queryUrl, {
      ...query,
      filter,
      columns: fields,
      pageSize: 'ALL', // Override default page size of 100
    });

    return sortBy(
      camelcaseKeys(surveys, {
        deep: true,
      }),
      ['name', 'surveyGroupName'],
    );
  }
}
