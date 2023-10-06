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
    const getEntity = entityId => this.req.ctx.models.entity.findById(entityId);

    console.log(
      'surveyResponseData',
      surveyResponseData.questions.map(q => q.config),
    );

    const processedResponse = await processSurveyResponse(surveyResponseData, getEntity);

    console.log('processedResponse', processedResponse);

    // return true;

    return centralApi.createSurveyResponses([processedResponse]);
  }
}
