import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUpdateSurveyResponseDraftRequest } from '@tupaia/types';
import { NotFoundError, PermissionsError } from '@tupaia/utils';

export type UpdateSurveyResponseDraftRequest = Request<
  DatatrakWebUpdateSurveyResponseDraftRequest.Params,
  DatatrakWebUpdateSurveyResponseDraftRequest.ResBody,
  DatatrakWebUpdateSurveyResponseDraftRequest.ReqBody,
  DatatrakWebUpdateSurveyResponseDraftRequest.ReqQuery
>;

export class UpdateSurveyResponseDraftRoute extends Route<UpdateSurveyResponseDraftRequest> {
  public async buildResponse() {
    const { ctx, params, body, models } = this.req;

    const { draftId } = params;
    const { id: userId } = await ctx.services.central.getUser();

    const draft = await models.surveyResponseDraft.findById(draftId);

    if (!draft) {
      throw new NotFoundError(`No draft found with ID ${draftId}`);
    }

    if (String(draft.user_id) !== String(userId)) {
      throw new PermissionsError('You do not have permission to update this draft');
    }

    const { entityId, formData, screenNumber } = body;

    await models.surveyResponseDraft.updateById(draftId, {
      ...(entityId !== undefined && { entity_id: entityId }),
      form_data: formData,
      screen_number: screenNumber,
      updated_at: new Date(),
    });

    return { message: 'Draft updated successfully' };
  }
}
