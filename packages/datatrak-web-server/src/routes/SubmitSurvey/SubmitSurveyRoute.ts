/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSubmitSurveyRequest as RequestT } from '@tupaia/types';
import { processSurveyResponse } from './processSurveyResponse';
import { addRecentEntities } from '../../utils';

export type SubmitSurveyRequest = Request<
  RequestT.Params,
  RequestT.ResBody,
  RequestT.ReqBody,
  RequestT.ReqQuery
>;

export class SubmitSurveyRoute extends Route<SubmitSurveyRequest> {
  public async buildResponse() {
    const surveyResponseData = this.req.body;
    const { central: centralApi } = this.req.ctx.services;
    const { session, models, ctx } = this.req;

    const { qr_codes_to_create, recent_entities, ...processedResponse } =
      await processSurveyResponse(models, ctx.services, surveyResponseData);

    await centralApi.createSurveyResponses(
      [processedResponse],
      // If the user is not logged in, submit the survey response as public
      processedResponse.user_id ? undefined : { submitAsPublic: true },
    );

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
