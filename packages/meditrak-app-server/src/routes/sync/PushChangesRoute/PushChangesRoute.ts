/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { ValidationError, yup } from '@tupaia/utils';
import { addSurveyImage } from './addSurveyImage';
import { validateSurveyResponseObject } from './validateInboundSurveyResponses';
import { translateSurveyResponseObject } from './translateInboundSurveyResponse';
import { populateData } from './populateData';
import { addSurveyFile } from './addSurveyFile';

const ACTIONS = {
  SubmitSurveyResponse: 'SubmitSurveyResponse',
  AddSurveyImage: 'AddSurveyImage',
  AddSurveyFile: 'AddSurveyFile',
};

const addSurveyImageValidator = yup.object().shape({
  id: yup.string().required(),
  data: yup.string().required(),
});

const addSurveyFileValidator = yup.object().shape({
  uniqueFileName: yup.string().required(),
  data: yup.string().required(),
});

type ChangeRecord = {
  action: typeof ACTIONS[keyof typeof ACTIONS];
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
          const { id, data } = addSurveyImageValidator.validateSync(payload);
          await addSurveyImage(id, data);
          break;
        }
        case ACTIONS.AddSurveyFile: {
          const { uniqueFileName, data } = addSurveyFileValidator.validateSync(payload);
          await addSurveyFile(this.req.models, uniqueFileName, data);
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
