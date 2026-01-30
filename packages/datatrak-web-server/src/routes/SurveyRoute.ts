import camelcaseKeys from 'camelcase-keys';
import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { isNullish } from '@tupaia/tsutils';
import { DatatrakWebSurveyRequest } from '@tupaia/types';
import { PermissionsError } from '@tupaia/utils';

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
    const _survey = await models.survey.findOneOrThrow(
      { code: surveyCode },
      { columns: ['id'] },
      `Survey with code ${surveyCode} not found`,
    );

    // check if user has access to survey
    const survey = await ctx.services.central.fetchResources(`surveys/${_survey.id}`, {
      columns: fields,
    });
    if (isNullish(survey))
      throw new PermissionsError(
        'You do not have access to this survey. If you think this is a mistake, please contact your system administrator.',
      );

    const { code: projectCode } = await models.project.findOneOrThrow(
      { id: survey.projectId },
      { columns: ['code'] },
      `No project exists with ID ${survey.projectId}`,
    );
    const project = await ctx.services.webConfig.fetchProject(projectCode);

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
