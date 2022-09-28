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
import { upsertCreatedData } from './upsertCreatedData';

const VALID_ACTIONS = ['SubmitSurveyResponse', 'AddSurveyImage'];

const addSurveyImageValidator = yup.object().shape({
  id: yup.string().required(),
  data: yup.string().required(),
});

type ChangeRecord = {
  action: typeof VALID_ACTIONS[number];
  payload: Record<string, unknown>;
};

export type PushChangesRequest = Request<
  Record<string, never>,
  { message: string },
  ChangeRecord[],
  { appVersion: string; since?: string; recordTypes?: string }
>;

export class PushChangesRoute extends Route<PushChangesRequest> {
  public async buildResponse() {
    const changes = this.req.body;

    const surveyResponses = [];
    const surveyImages: { id: string; data: string }[] = [];

    for (const { action, payload } of changes) {
      if (!VALID_ACTIONS.includes(action)) {
        throw new ValidationError(`${action} is not a supported change action`);
      }

      if (action === 'SubmitSurveyResponse') {
        const translatedPayload = await translateSurveyResponseObject(this.req.models, payload);
        const validatedSurveyResponse = await validateSurveyResponseObject(
          this.req.models,
          translatedPayload,
        );
        await upsertCreatedData(this.req.models, validatedSurveyResponse);
        const surveyResponseWithPopulatedData = await populateData(
          this.req.models,
          validatedSurveyResponse,
        );
        surveyResponses.push({ ...surveyResponseWithPopulatedData, ...rest });
      } else {
        const validatedPayload = addSurveyImageValidator.validateSync(payload);
        surveyImages.push(validatedPayload);
      }
    }

    // Submit survey responses
    await this.req.ctx.services.central.createSurveyResponses(surveyResponses);

    // Add survey images
    for (const surveyImage of surveyImages) {
      const { id, data } = surveyImage;
      await addSurveyImage(id, data);
    }

    return { message: 'Successfully integrated changes into server database' };
  }
}
