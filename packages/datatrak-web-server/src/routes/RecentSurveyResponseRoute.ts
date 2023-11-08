/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebRecentSurveyResponseRequest } from '@tupaia/types';

export type RecentSurveyResponseRequest = Request<
  DatatrakWebRecentSurveyResponseRequest.Params,
  DatatrakWebRecentSurveyResponseRequest.ResBody,
  DatatrakWebRecentSurveyResponseRequest.ReqBody,
  DatatrakWebRecentSurveyResponseRequest.ReqQuery
>;

const ANSWER_COLUMNS = [
  'text', 'question.code'
]

export class RecentSurveyResponseRoute extends Route<RecentSurveyResponseRequest> {
  public async buildResponse() {
    const { ctx, params } = this.req;
    const { id: responseId } = params;

    const surveyResponse = await ctx.services.central.fetchResources(`surveyResponse/${responseId}`);
    const answerList = await ctx.services.central.fetchResources('answers', {
      filter: { survey_response_id: surveyResponse.id },
      columns: ANSWER_COLUMNS,
    });
    const answers = answerList.reduce((output: Record<string, string>, answer: any) => ({ ...output, [answer['question.code']]: answer.text }), {});

    return camelcaseKeys({ ...surveyResponse, answers }, { deep: true });
  }
}
