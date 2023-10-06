/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
// @ts-nocheck
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSubmitSurveyRequest as RequestT } from '@tupaia/types';
import { processSurveyResponse } from '../utils';

export type SubmitSurveyRequest = Request<RequestT.Params, RequestT.ResBody, RequestT.ReqBody, any>;

export class SubmitSurveyRoute extends Route<SubmitSurveyRequest> {
  public async buildResponse() {
    const surveyResponseData = this.req.body;
    const { central: centralApi } = this.req.ctx.services;

    // The processSurvey util needs this to look up entity records. Pass in a util function rather than the whole model context
    const getEntity = entityId => this.req.ctx.models.entity.findById(entityId);

    const processedResponse = await processSurveyResponse(surveyResponseData, getEntity);

    return centralApi.createSurveyResponses([processedResponse]);
  }
}
