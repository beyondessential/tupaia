/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';

export type SurveyScreenComponentsRequest = Request<
  { surveyCode: string },
  Record<string, unknown>[],
  Record<string, never>
>;

export class SurveyScreenComponentsRoute extends Route<SurveyScreenComponentsRequest> {
  public async buildResponse() {
    const { ctx, params } = this.req;
    const { surveyCode } = params;
    const [survey] = await ctx.services.central.fetchResources('surveys', {
      filter: { code: surveyCode },
    });

    if (!survey) {
      throw new Error(`Could not find survey with code: ${surveyCode}`);
    }

    const columns = [
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
    ];
    return camelcaseKeys(
      await ctx.services.central.fetchResources(`surveys/${survey.id}/surveyScreenComponents`, {
        columns,
      }),
    );
  }
}
