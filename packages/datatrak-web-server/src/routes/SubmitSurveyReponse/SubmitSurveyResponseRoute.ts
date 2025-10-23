import { Request } from 'express';

import { SurveyResponseModel, UserModel } from '@tupaia/database';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSubmitSurveyResponseRequest as RequestT } from '@tupaia/types';
import { handleTaskCompletion } from './handleTaskCompletion';

export type SubmitSurveyResponseRequest = Request<
  RequestT.Params,
  RequestT.ResBody,
  RequestT.ReqBody,
  RequestT.ReqQuery
>;

export class SubmitSurveyResponseRoute extends Route<SubmitSurveyResponseRequest> {
  public async buildResponse() {
    const surveyResponseData = this.req.body;
    const { central: centralApi } = this.req.ctx.services;
    const { session, models } = this.req;

    const { qr_codes_to_create, recent_entities, ...processedResponse } =
      await SurveyResponseModel.processSurveyResponse(models, surveyResponseData);

    const response = await centralApi.createSurveyResponse(
      processedResponse,
      // If the user is not logged in, submit the survey response as public
      processedResponse.user_id ? undefined : { submitAsPublic: true },
    );

    // If the user is logged in, add the entities they answered to their recent entities list
    if (!!session && processedResponse.user_id) {
      const { user_id: userId } = processedResponse;
      // add these after the survey response has been submitted because we want to be able to add newly created entities to the recent entities list
      await UserModel.addRecentEntities(models, userId, recent_entities);
    }

    await handleTaskCompletion(models, {
      ...processedResponse,
      id: response.surveyResponseId,
    });

    return {
      qrCodeEntitiesCreated: qr_codes_to_create,
    };
  }
}
