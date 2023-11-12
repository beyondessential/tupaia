/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';

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
  'id',
  'survey.name',
  'survey.code',
];

export class SingleSurveyResponseRoute extends Route<SingleSurveyResponseRequest> {
  public async buildResponse() {
    const { ctx, params, query } = this.req;
    const { id: responseId } = params;

    const { fields = DEFAULT_FIELDS } = query;

    const surveyResponse = await ctx.services.central.fetchResources(
      `surveyResponses/${responseId}`,
      { columns: fields },
    );
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
    return camelcaseKeys({ ...surveyResponse, answers });
  }
}
