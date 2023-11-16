/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSubmitSurveyRequest } from '@tupaia/types';
import { processSurveyResponse } from './processSurveyResponse';
import { validateSurveySubmission } from './validateSurveySubmission';

export type SubmitSurveyRequest = Request<
  DatatrakWebSubmitSurveyRequest.Params,
  DatatrakWebSubmitSurveyRequest.ResBody,
  DatatrakWebSubmitSurveyRequest.ReqBody,
  DatatrakWebSubmitSurveyRequest.ReqQuery
>;

export class SubmitSurveyRoute extends Route<SubmitSurveyRequest> {
  protected getEntity(entityId: string) {
    // The processSurvey util needs this to look up entity records. Pass in a util function rather than the whole model context
    return this.req.models.entity.findById(entityId);
  }
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;
    const surveyResponseData = validateSurveySubmission(this.req.body);

    const { qr_codes_to_create, ...processedResponse } = await processSurveyResponse(
      surveyResponseData,
      this.getEntity,
    );

    await centralApi.createSurveyResponses([processedResponse]);
    return {
      qrCodeEntitiesCreated: qr_codes_to_create || [],
    };
  }
}
