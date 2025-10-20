import camelcaseKeys from 'camelcase-keys';
import { Request } from 'express';

import { AccessPolicy } from '@tupaia/access-policy';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSingleSurveyResponseRequest, QuestionType } from '@tupaia/types';
import { PermissionsError } from '@tupaia/utils';

export type SingleSurveyResponseRequest = Request<
  DatatrakWebSingleSurveyResponseRequest.Params,
  DatatrakWebSingleSurveyResponseRequest.ResBody,
  DatatrakWebSingleSurveyResponseRequest.ReqBody,
  DatatrakWebSingleSurveyResponseRequest.ReqQuery
>;

const ANSWER_COLUMNS = ['text', 'question_id', 'type'];

const DEFAULT_FIELDS = [
  'assessor_name',
  'country.name',
  'data_time',
  'end_time',
  'entity.name',
  'entity.id',
  'id',
  'survey.name',
  'survey.code',
  'user_id',
  'country.code',
  'survey.permission_group_id',
  'timezone',
  'survey.project_id',
];

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

const assertCanViewSurveyResponse = (
  accessPolicy: AccessPolicy,
  countryCode: string,
  surveyPermissionGroupName: string,
) => {
  const isBESAdmin = accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
  if (isBESAdmin) {
    return true;
  }

  // The user must have access to the country with the survey permission group
  const hasAccessToCountry = accessPolicy.allows(countryCode, surveyPermissionGroupName);
  if (!hasAccessToCountry) {
    throw new PermissionsError('You do not have access to view this survey response');
  }

  return true;
};

export class SingleSurveyResponseRoute extends Route<SingleSurveyResponseRequest> {
  public async buildResponse() {
    const { ctx, params, query, accessPolicy, models } = this.req;
    const { id: responseId } = params;

    const { fields = DEFAULT_FIELDS } = query;

    const currentUser = await ctx.services.central.getUser();
    const { id } = currentUser;

    const surveyResponse = await ctx.services.central.fetchResources(
      `surveyResponses/${responseId}`,
      { columns: fields },
    );

    if (!surveyResponse) {
      throw new Error(`Survey response with id ${responseId} not found`);
    }

    const {
      user_id: userId,
      'country.code': countryCode,
      'survey.permission_group_id': surveyPermissionGroupId,
      'survey.project_id': projectId,
      ...response
    } = surveyResponse;

    // If the user is not the owner of the survey response, they should not be able to view the survey response unless they are a BES admin or have access to the admin panel
    if (userId !== id) {
      const permissionGroup = await models.permissionGroup.findById(surveyPermissionGroupId);
      if (!permissionGroup) {
        throw new Error('Permission group for survey not found');
      }
      assertCanViewSurveyResponse(accessPolicy, countryCode, permissionGroup.name);
    }

    const entityParentName = await models.entity.getParentEntityName(
      projectId,
      response['entity.id'],
    );

    const answerList = await ctx.services.central.fetchResources('answers', {
      filter: { survey_response_id: surveyResponse.id },
      columns: ANSWER_COLUMNS,
      pageSize: 'ALL',
    });

    const answers: DatatrakWebSingleSurveyResponseRequest.ResBody['answers'] = {};
    for (const answer of answerList) {
      const { question_id: questionId, type, text } = answer;
      if (!text) continue;
      if (type === QuestionType.User) {
        const user = await models.user.findById(text);
        if (!user) {
          // Log the error but continue to the next answer. This is in case the user was deleted
          console.error(`User with id ${text} not found`);
          continue;
        }
        answers[questionId] = { id: user.id, name: user.full_name };
        continue;
      }
      answers[questionId] = text;
    }

    // Don't return the answers in camel case because the keys are question IDs which we want in lowercase
    return camelcaseKeys({ ...response, countryCode, entityParentName, userId, answers });
  }
}
