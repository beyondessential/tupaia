import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSaveSurveyResponseDraftRequest } from '@tupaia/types';

export type SaveSurveyResponseDraftRequest = Request<
  DatatrakWebSaveSurveyResponseDraftRequest.Params,
  DatatrakWebSaveSurveyResponseDraftRequest.ResBody,
  DatatrakWebSaveSurveyResponseDraftRequest.ReqBody,
  DatatrakWebSaveSurveyResponseDraftRequest.ReqQuery
>;

export class SaveSurveyResponseDraftRoute extends Route<SaveSurveyResponseDraftRequest> {
  public async buildResponse() {
    const { ctx, body } = this.req;

    const { id: userId } = await ctx.services.central.getUser();

    const { surveyId, countryCode, entityId, startTime, formData, screenNumber } = body;

    const draft = await ctx.services.central.createResource(
      'surveyResponseDrafts',
      {},
      {
        survey_id: surveyId,
        user_id: userId,
        country_code: countryCode,
        entity_id: entityId ?? null,
        start_time: startTime ?? null,
        form_data: formData,
        screen_number: screenNumber,
      },
    );

    return { id: draft.id };
  }
}
