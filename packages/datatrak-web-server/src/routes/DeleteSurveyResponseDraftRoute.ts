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
    const { ctx, params } = this.req;

    const { draftId } = params;
    const { id: userId } = await ctx.services.central.getUser();

    const draft = await ctx.services.central.fetchResources(`surveyResponseDrafts/${draftId}`);

    if (!draft) {
      throw new NotFoundError(`No draft found with ID ${draftId}`);
    }

    if (draft.user_id !== userId) {
      throw new PermissionsError('You do not have permission to delete this draft');
    }

    await ctx.services.central.deleteResource(`surveyResponseDrafts/${draftId}`);

    return { message: 'Draft deleted successfully' };
  }
}
