import { Request } from 'express';

import { SurveyResponseModel } from '@tupaia/database';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebResubmitSurveyResponseRequest as RequestT } from '@tupaia/types';
import { addRecentEntities } from '../../utils';

export type ResubmitSurveyResponseRequest = Request<
  RequestT.Params,
  RequestT.ResBody,
  RequestT.ReqBody,
  RequestT.ReqQuery
>;

export class ResubmitSurveyResponseRoute extends Route<ResubmitSurveyResponseRequest> {
  public async buildResponse() {
    const surveyResponseData = this.req.body;
    const { central: centralApi } = this.req.ctx.services;
    const { session, models, params } = this.req;
    const { originalSurveyResponseId } = params;

    const { qr_codes_to_create, recent_entities, ...processedResponse } =
      await SurveyResponseModel.processSurveyResponse(models, surveyResponseData);

    await centralApi.resubmitSurveyResponse(originalSurveyResponseId, processedResponse);

    // If the user is logged in, add the entities they answered to their recent entities list
    if (!!session && processedResponse.user_id) {
      const { user_id: userId } = processedResponse;
      // add these after the survey response has been submitted because we want to be able to add newly created entities to the recent entities list
      await addRecentEntities(models, userId, recent_entities);
    }

    return {
      qrCodeEntitiesCreated: qr_codes_to_create || [],
    };
  }
}
