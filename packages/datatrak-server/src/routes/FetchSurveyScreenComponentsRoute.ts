/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchSurveyScreenComponentsRequest = Request<
  { surveyCode: string },
  Record<string, unknown>[],
  Record<string, never>
>;

const surveysEndpoint = 'surveys';
const getSurveyScreenComponentsEndpoint = (surveyId: string) =>
  `surveys/${surveyId}/surveyScreenComponents`;

export class FetchSurveyScreenComponentsRoute extends Route<FetchSurveyScreenComponentsRequest> {
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;
    const { surveyCode } = this.req.params;
    const [survey] = await centralApi.fetchResources(surveysEndpoint, {
      filter: { code: surveyCode },
    });

    if (!survey) {
      throw new Error(`Could not find survey with code: ${surveyCode}`);
    }

    const endpoint = getSurveyScreenComponentsEndpoint(survey.id);
    const columns = JSON.stringify([
      'id',
      'question_id',
      'screen_id',
      'component_number',
      'answers_enabling_follow_up',
      'is_follow_up',
      'visibility_criteria',
      'validation_criteria',
      'question_label',
      'detail_label',
      'config',
      'question.name',
      'question.code',
      'question.text',
      'question.name',
      'question.type',
      'question.options',
      'survey_screen.screen_number',
    ]);
    const surveyScreenComponents = await centralApi.fetchResources(endpoint, { columns });
    return surveyScreenComponents;
  }
}
