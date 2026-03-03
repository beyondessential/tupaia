import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebDeleteSurveyResponseDraftRequest } from '@tupaia/types';
import { NotFoundError, PermissionsError } from '@tupaia/utils';

export type DeleteSurveyResponseDraftRequest = Request<
  DatatrakWebDeleteSurveyResponseDraftRequest.Params,
  DatatrakWebDeleteSurveyResponseDraftRequest.ResBody,
  DatatrakWebDeleteSurveyResponseDraftRequest.ReqBody,
  DatatrakWebDeleteSurveyResponseDraftRequest.ReqQuery
>;

export class DeleteSurveyResponseDraftRoute extends Route<DeleteSurveyResponseDraftRequest> {
  public async buildResponse() {
    const { ctx, params, models } = this.req;

    const { draftId } = params;
    const { id: userId } = await ctx.services.central.getUser();

    const draft = await models.surveyResponseDraft.findById(draftId);

    if (!draft) {
      throw new NotFoundError(`No draft found with ID ${draftId}`);
    }

    if (draft.user_id !== userId) {
      throw new PermissionsError('You do not have permission to delete this draft');
    }

    await models.surveyResponseDraft.deleteById(draftId);

    return { message: 'Draft deleted successfully' };
  }
}
