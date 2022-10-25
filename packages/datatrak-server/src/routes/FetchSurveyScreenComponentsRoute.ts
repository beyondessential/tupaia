/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchSurveyScreenComponentsRequest = Request<
  { surveyId: string },
  Record<string, unknown>[],
  Record<string, never>
>;

const getSurveyScreenComponentsEndpoint = (surveyId: string) =>
  `surveys/${surveyId}/surveyScreenComponents`;

export class FetchSurveyScreenComponentsRoute extends Route<FetchSurveyScreenComponentsRequest> {
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;
    const { surveyId } = this.req.params;
    const endpoint = getSurveyScreenComponentsEndpoint(surveyId);
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
      'survey_screen.screen_number',
    ]);
    const surveyScreenComponents = await centralApi.fetchResources(endpoint, { columns });
    return surveyScreenComponents;
  }
}
