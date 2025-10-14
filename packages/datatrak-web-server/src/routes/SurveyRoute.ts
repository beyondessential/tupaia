import camelcaseKeys from 'camelcase-keys';
import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { isNullish } from '@tupaia/tsutils';
import { DatatrakWebSurveyRequest, WebServerProjectRequest } from '@tupaia/types';
import { NotFoundError, PermissionsError } from '@tupaia/utils';

export interface SurveyRequest
  extends Request<
    DatatrakWebSurveyRequest.Params,
    DatatrakWebSurveyRequest.ResBody,
    DatatrakWebSurveyRequest.ReqBody,
    DatatrakWebSurveyRequest.ReqQuery
  > {}

const DEFAULT_FIELDS = [
  'can_repeat',
  'code',
  'id',
  'name',
  'paginatedQuestions', // This comes from central-server `GET /surveys` handler, not from database
  'project_id',
  'survey_group.name',
] as const;

export class SurveyRoute extends Route<SurveyRequest> {
  public async buildResponse() {
    const {
      ctx,
      query = {},
      params: { surveyCode },
      models,
    } = this.req;
    const { fields = DEFAULT_FIELDS } = query;
    // check if survey exists in the database
    const _survey = await models.survey.findOne({ code: surveyCode });
    if (isNullish(_survey)) throw new NotFoundError(`Survey with code ${surveyCode} not found`);

    // check if user has access to survey
    const survey = await ctx.services.central.fetchResources(`surveys/${_survey.id}`, {
      filter: { code: surveyCode },
      columns: fields,
    });

    if (isNullish(survey))
      throw new PermissionsError(
        'You do not have access to this survey. If you think this is a mistake, please contact your system administrator.',
      );

    const { projects } = await ctx.services.webConfig.fetchProjects();
    const project = survey.project_id
      ? projects.find(({ id }: WebServerProjectRequest.ProjectResponse) => id === survey.project_id)
      : null;

    return {
      ...camelcaseKeys(survey, {
        deep: true,
        // Don’t touch JSONB attributes
        stopPaths: [
          'screens.survey_screen_components.config',
          'screens.survey_screen_components.validation_criteria',
          'screens.survey_screen_components.visibility_criteria',
        ],
      }),
      project,
    };
  }
}
