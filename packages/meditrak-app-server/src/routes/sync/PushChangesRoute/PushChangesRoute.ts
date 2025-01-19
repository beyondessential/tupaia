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

    for (const { action, payload } of changes) {
      switch (action) {
        case ACTIONS.SubmitSurveyResponse: {
          const translatedPayload = await translateSurveyResponseObject(this.req.models, payload);
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
