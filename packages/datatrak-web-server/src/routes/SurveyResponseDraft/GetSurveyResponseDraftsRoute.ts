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

    const { id: userId } = await ctx.services.central.getUser();

    const drafts = await models.surveyResponseDraft.find(
      { user_id: userId },
      {
        sort: ['updated_at DESC'],
      },
    );

    if (!drafts || drafts.length === 0) {
      return [];
    }

    // Batch fetch surveys and entities to avoid N+1 queries
    const surveyIds = [...new Set(drafts.map(d => d.survey_id).filter(Boolean))] as string[];
    const entityIds = [...new Set(drafts.map(d => d.entity_id).filter(Boolean))] as string[];

    const [surveys, entities] = await Promise.all([
      surveyIds.length > 0 ? models.survey.findManyById(surveyIds) : [],
      entityIds.length > 0 ? models.entity.findManyById(entityIds) : [],
    ]);

    // Create lookup maps for O(1) access
    const surveyMap = new Map(surveys.map(s => [s.id, s]));
    const entityMap = new Map(entities.map(e => [e.id, e]));

    const enrichedDrafts = drafts.map(draft => {
      const survey = draft.survey_id ? surveyMap.get(draft.survey_id as string) : null;
      const entity = draft.entity_id ? entityMap.get(draft.entity_id as string) : null;

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
    });

    return enrichedDrafts as DatatrakWebSurveyResponseDraftsRequest.ResBody;
  }
}
