import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSaveSurveyResponseDraftRequest } from '@tupaia/types';
import { PermissionsError } from '@tupaia/utils';

export type SaveSurveyResponseDraftRequest = Request<
  DatatrakWebSaveSurveyResponseDraftRequest.Params,
  DatatrakWebSaveSurveyResponseDraftRequest.ResBody,
  DatatrakWebSaveSurveyResponseDraftRequest.ReqBody,
  DatatrakWebSaveSurveyResponseDraftRequest.ReqQuery
>;

export class SaveSurveyResponseDraftRoute extends Route<SaveSurveyResponseDraftRequest> {
  public async buildResponse() {
    const { ctx, body, models } = this.req;

    const { id: userId } = await ctx.services.central.getUser();

    const { surveyId, countryCode, entityId, startTime, formData, screenNumber } = body;

    // Validate user has access to the survey
    const survey = await ctx.services.central.fetchResources(`surveys/${surveyId}`, {
      columns: ['id'],
    });

    if (!survey) {
      throw new PermissionsError(
        'You do not have access to this survey. If you think this is a mistake, please contact your system administrator.',
      );
    }

    // Validate user has access to the entity if provided
    if (entityId) {
      const entity = await ctx.services.central.fetchResources('entities', {
        filter: { id: entityId },
        columns: ['id'],
      });

      if (!entity || entity.length === 0) {
        throw new PermissionsError(
          'You do not have access to this entity. If you think this is a mistake, please contact your system administrator.',
        );
      }
    }

    const draft = await models.surveyResponseDraft.create({
      survey_id: surveyId,
      user_id: userId,
      country_code: countryCode,
      entity_id: entityId ?? null,
      start_time: startTime ? new Date(startTime) : undefined,
      form_data: formData,
      screen_number: screenNumber,
    });

    return { id: draft.id };
  }
}
