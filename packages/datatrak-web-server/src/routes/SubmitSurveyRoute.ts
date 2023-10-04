/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSubmitSurveyRequest as RequestT } from '@tupaia/types';
import { createUpsertEntityObjects } from '../utils/createUpsertEntityObjects';

export type SubmitSurveyRequest = Request<
  RequestT.Params,
  RequestT.ResBody,
  RequestT.ReqBody,
  RequestT.ReqQuery
>;

export class SubmitSurveyRoute extends Route<SubmitSurveyRequest> {
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;
    const surveyResponseData = this.req.body;
    const { answers, entities_upserted, country_id } = surveyResponseData;

    const upsertEntityObjects = await createUpsertEntityObjects(
      this.req.models,
      entities_upserted,
      answers,
      country_id,
    );

    return centralApi.createSurveyResponses([
      {
        ...surveyResponseData,
        entities_upserted: upsertEntityObjects,
      },
    ]);
  }
}
