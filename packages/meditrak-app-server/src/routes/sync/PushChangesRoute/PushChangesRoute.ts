/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import winston from 'winston';
import { Route } from '@tupaia/server-boilerplate';
import { ValidationError } from '@tupaia/utils';
import { validateSurveyResponseObject } from './validateInboundSurveyResponses';
import { translateSurveyResponseObject } from './translateInboundSurveyResponse';
import { populateData } from './populateData';

const ACTIONS = {
  SubmitSurveyResponse: 'SubmitSurveyResponse',
  AddSurveyImage: 'AddSurveyImage',
  AddSurveyFile: 'AddSurveyFile',
};

type ChangeRecord = {
  action: (typeof ACTIONS)[keyof typeof ACTIONS];
  payload: { survey_response: Record<string, unknown> } | Record<string, unknown>;
};

export type PushChangesRequest = Request<
  Record<string, never>,
  { message: string },
  ChangeRecord[],
  { appVersion: string; since?: string; recordTypes?: string }
>;

export class PushChangesRoute extends Route<PushChangesRequest> {
  private extractSurveyResponseFromPayload(payload: Record<string, unknown>) {
    if (payload.survey_response) {
      return payload.survey_response as Record<string, unknown>;
    }
    return payload;
  }

  public async buildResponse() {
    const changes = this.req.body;

    const surveyResponses = [];

    for (const { action, payload } of changes) {
      switch (action) {
        case ACTIONS.SubmitSurveyResponse: {
          const surveyResponse = this.extractSurveyResponseFromPayload(payload);
          const translatedPayload = await translateSurveyResponseObject(
            this.req.models,
            surveyResponse,
          );
          const validatedSurveyResponse = validateSurveyResponseObject(translatedPayload);
          const surveyResponseWithPopulatedData = await populateData(
            this.req.models,
            validatedSurveyResponse,
          );
          surveyResponses.push(surveyResponseWithPopulatedData);
          break;
        }
        case ACTIONS.AddSurveyImage: {
          winston.info(`Legacy ${ACTIONS.AddSurveyImage} action requested, skipping`);
          break;
        }
        case ACTIONS.AddSurveyFile: {
          winston.info(`Legacy ${ACTIONS.AddSurveyFile} action requested, skipping`);
          break;
        }
        default:
          throw new ValidationError(`${action} is not a supported change action`);
      }
    }

    // Submit survey responses
    await this.req.ctx.services.central.createSurveyResponses(surveyResponses);

    return { message: 'Successfully integrated changes into server database' };
  }
}
