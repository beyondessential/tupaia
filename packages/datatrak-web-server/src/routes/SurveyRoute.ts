import camelcaseKeys from 'camelcase-keys';
import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
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
  'name',
  'code',
  'id',
  'can_repeat',
  'survey_group.name',
  'project_id',
  'surveyQuestions',
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
    const surveyCount = await models.survey.count({ code: surveyCode });
    if (surveyCount === 0) throw new NotFoundError(`Survey with code ${surveyCode} not found`);

    // check if user has access to survey
    const surveys = await ctx.services.central.fetchResources('surveys', {
      filter: { code: surveyCode },
      columns: fields,
    });

    if (!surveys.length)
      throw new PermissionsError(
        'You do not have access to this survey. If you think this is a mistake, please contact your system administrator.',
      );

    const survey = camelcaseKeys(surveys[0], { deep: true });

    const { projects } = await ctx.services.webConfig.fetchProjects();
    const project = survey?.projectId
      ? projects.find(({ id }: WebServerProjectRequest.ProjectResponse) => id === survey.projectId)
      : null;

    // Replace flat array of `surveyQuestions` with 2D array of `screens` of questions
    const { surveyQuestions, ...restOfSurvey } = survey;
    return {
      ...restOfSurvey,
      screens: await survey.getPaginatedQuestions(),
      project,
    };
  }
}
