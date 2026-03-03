import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';

export type GetSurveyResponseDraftsRequest = Request<
  DatatrakWebSurveyResponseDraftsRequest.Params,
  DatatrakWebSurveyResponseDraftsRequest.ResBody,
  DatatrakWebSurveyResponseDraftsRequest.ReqBody,
  DatatrakWebSurveyResponseDraftsRequest.ReqQuery
>;

export class GetSurveyResponseDraftsRoute extends Route<GetSurveyResponseDraftsRequest> {
  public async buildResponse() {
    const { ctx, models } = this.req;
    console.log('GetSurveyResponseDraftsRoute');

    const { id: userId } = await ctx.services.central.getUser();

    const drafts = await models.surveyResponseDraft.find(
      { user_id: userId },
      {
        sort: ['updated_at DESC'],
      },
    );

    console.log('drafts.length', drafts.length);

    if (!drafts || drafts.length === 0) {
      return [];
    }

    const enrichedDrafts = await Promise.all(
      drafts.map(async draft => {
        const survey = draft.survey_id
          ? await models.survey.findById(draft.survey_id as string)
          : null;

        const entity = draft.entity_id
          ? await models.entity.findById(draft.entity_id as string)
          : null;

        return {
          id: draft.id,
          surveyId: draft.survey_id,
          surveyCode: survey?.code ?? null,
          surveyName: survey?.name ?? null,
          countryCode: (draft.country_code as string) ?? entity?.country_code ?? null,
          entityId: draft.entity_id ?? null,
          entityName: entity?.name ?? null,
          startTime: draft.start_time ?? null,
          formData: draft.form_data,
          screenNumber: draft.screen_number,
          updatedAt: draft.updated_at,
        };
      }),
    );

    return enrichedDrafts as DatatrakWebSurveyResponseDraftsRequest.ResBody;
  }
}
