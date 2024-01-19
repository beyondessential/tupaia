/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSubmitSurveyRequest as RequestT } from '@tupaia/types';
import { processSurveyResponse } from './processSurveyResponse';
import { addRecentEntity as addRecentEntityUtil } from '../../utils';

export type SubmitSurveyRequest = Request<
  RequestT.Params,
  RequestT.ResBody,
  RequestT.ReqBody,
  RequestT.ReqQuery
>;

export class SubmitSurveyRoute extends Route<SubmitSurveyRequest> {
  public async buildResponse() {
    const surveyResponseData = this.req.body;
    const { models } = this.req;
    const { central: centralApi } = this.req.ctx.services;
    const { session } = this.req;

    // The processSurvey util needs this to look up entity records. Pass in a util function rather than the whole model context
    const findEntityById = (entityId: string) => this.req.models.entity.findById(entityId);
    const addRecentEntity = async (userId: string, entityId: string) => {
      // If we're submitting publicly (no session) don't track recent entities
      if (!!session) {
        await addRecentEntityUtil(this.req.models, userId, entityId);
      }
    };

    const { qr_codes_to_create, ...processedResponse } = await processSurveyResponse(
      surveyResponseData,
      findEntityById,
      addRecentEntity,
    );

    await centralApi.createSurveyResponses(
      [processedResponse],
      // If the user is not logged in, submit the survey response as public
      processedResponse.user_id ? undefined : { submitAsPublic: true },
    );
    return {
      qrCodeEntitiesCreated: qr_codes_to_create || [],
    };
  }
}
