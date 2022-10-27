/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type SubmitSurveyResponseRequest = Request<
  Record<string, never>,
  void,
  { entity: string; survey: string; timestamp: string; answers: Record<string, string> }
>;

const surveysEndpoint = 'surveys';

export class SubmitSurveyResponseRoute extends Route<SubmitSurveyResponseRequest> {
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;
    const { entity, survey: surveyCode, timestamp, answers } = this.req.body;

    const [survey] = await centralApi.fetchResources(surveysEndpoint, {
      filter: { code: surveyCode },
    });

    if (!survey) {
      throw new Error(`Could not find survey with code: ${surveyCode}`);
    }

    return centralApi.createSurveyResponses([
      { entityCode: entity, surveyId: survey.id, timestamp, answers },
    ]);
  }
}
