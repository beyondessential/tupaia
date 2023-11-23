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

const PUBLIC_USER_EMAIL = 'public@tupaia.org';

export class SubmitSurveyRoute extends Route<SubmitSurveyRequest> {
  public async buildResponse() {
    const surveyResponseData = this.req.body;
    const { central: centralApi } = this.req.ctx.services;
    const { models } = this.req;

    // The processSurvey util needs this to look up entity records. Pass in a util function rather than the whole model context
    const getEntity = (entityId: string) => models.entity.findById(entityId);

    // If the user is not logged in, use the public user
    if (!surveyResponseData.userId) {
      // Add public user here rather than pass it to the frontend because it's only meant to be used to submit surveys and
      // we don't want to expose it to other endpoints
      console.log('look up user');
      const user = await models.user.findOne({ email: PUBLIC_USER_EMAIL });
      console.log('user', user);
      surveyResponseData.userId = user.id;
    }

    const { qr_codes_to_create, ...processedResponse } = await processSurveyResponse(
      surveyResponseData,
      getEntity,
    );

    console.log('---', processedResponse);

    await centralApi.createSurveyResponses([processedResponse]);
    return {
      qrCodeEntitiesCreated: qr_codes_to_create || [],
    };
  }
}
