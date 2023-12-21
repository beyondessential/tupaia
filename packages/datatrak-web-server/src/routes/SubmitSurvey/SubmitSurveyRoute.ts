/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSubmitSurveyRequest as RequestT } from '@tupaia/types';
import { processSurveyResponse } from './processSurveyResponse';

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

    // The processSurvey util needs this to look up entity records. Pass in a util function rather than the whole model context
    const getEntity = (entityId: string) => this.req.models.entity.findById(entityId);

    const { qr_codes_to_create, ...processedResponse } = await processSurveyResponse(
      surveyResponseData,
      getEntity,
    );

    await centralApi.createSurveyResponses([processedResponse]);
    return {
      qrCodeEntitiesCreated: qr_codes_to_create || [],
    };
  }
}
