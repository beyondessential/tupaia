/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { AccessPolicy } from '@tupaia/access-policy';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../constants';
import { PermissionsError } from '@tupaia/utils';

export type SingleSurveyResponseRequest = Request<
  DatatrakWebSingleSurveyResponseRequest.Params,
  DatatrakWebSingleSurveyResponseRequest.ResBody,
  DatatrakWebSingleSurveyResponseRequest.ReqBody,
  DatatrakWebSingleSurveyResponseRequest.ReqQuery
>;

const ANSWER_COLUMNS = ['text', 'question_id'];

const DEFAULT_FIELDS = [
  'assessor_name',
  'country.name',
  'data_time',
  'entity.name',
  'entity.id',
  'id',
  'survey.name',
  'survey.code',
  'user_id',
  'country.code',
];

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

// If the user is not a BES admin or does not have access to the admin panel, they should not be able to view the survey response
const assertCanViewSurveyResponse = (accessPolicy: AccessPolicy, countryCode: string) => {
  const isBESAdmin = accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
  const hasAdminPanelAccess = accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
  if (!isBESAdmin && !hasAdminPanelAccess) {
    throw new PermissionsError('You do not have access to view this survey response');
  }
};

export class SingleSurveyResponseRoute extends Route<SingleSurveyResponseRequest> {
  public async buildResponse() {
    const { ctx, params, query, accessPolicy } = this.req;
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

    const { user_id: userId, 'country.code': countryCode, ...response } = surveyResponse;

    // If the user is not the owner of the survey response, they should not be able to view the survey response unless they are a BES admin or have access to the admin panel
    if (userId !== id) {
      assertCanViewSurveyResponse(accessPolicy, countryCode);
    }

    const answerList = await ctx.services.central.fetchResources('answers', {
      filter: { survey_response_id: surveyResponse.id },
      columns: ANSWER_COLUMNS,
    });
    const answers = answerList.reduce(
      (output: Record<string, string>, answer: { question_id: string; text: string }) => ({
        ...output,
        [answer.question_id]: answer.text,
      }),
      {},
    );

    // Don't return the answers in camel case because the keys are question IDs which we want in lowercase
    return camelcaseKeys({ ...response, userId, answers });
  }
}
