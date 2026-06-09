import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveyResponseDraftsRequest, EntityTypeEnum } from '@tupaia/types';

export type GetSurveyResponseDraftsRequest = Request<
  DatatrakWebSurveyResponseDraftsRequest.Params,
  DatatrakWebSurveyResponseDraftsRequest.ResBody,
  DatatrakWebSurveyResponseDraftsRequest.ReqBody,
  DatatrakWebSurveyResponseDraftsRequest.ReqQuery
>;

const DEFAULT_PAGE_LIMIT = 20;

export class GetSurveyResponseDraftsRoute extends Route<GetSurveyResponseDraftsRequest> {
  public async buildResponse() {
    const { ctx, models, query } = this.req;
    const { page: queryPage, pageLimit: queryPageLimit, projectId } = query;

    const page = queryPage ? parseInt(queryPage, 10) : 0;
    const pageLimit = queryPageLimit ? parseInt(queryPageLimit, 10) : DEFAULT_PAGE_LIMIT;

    const { id: userId } = await ctx.services.central.getUser();

    const findConditions: Record<string, any> = { user_id: userId, is_deleted: false };

    // Filter by project if specified: join through survey table
    if (projectId) {
      findConditions['survey.project_id'] = projectId;
    }

    const drafts = await models.surveyResponseDraft.find(
      findConditions as any,
      {
        sort: ['survey_response_draft.updated_at DESC'],
        limit: pageLimit + 1, // Fetch one extra to check if there are more pages
        offset: page * pageLimit,
        ...(projectId
          ? {
              joinWith: 'survey',
              joinCondition: ['survey.id', 'survey_response_draft.survey_id'],
            }
          : {}),
      },
    );

    const hasMorePages = drafts.length > pageLimit;
    const paginatedDrafts = hasMorePages ? drafts.slice(0, pageLimit) : drafts;

    if (paginatedDrafts.length === 0) {
      return { items: [], hasMorePages: false, pageNumber: page };
    }

    // Batch fetch surveys (permission-filtered) and entities to avoid N+1 queries
    const surveyIds = [...new Set(paginatedDrafts.map(d => d.survey_id).filter(Boolean))] as string[];
    const entityIds = [...new Set(paginatedDrafts.map(d => d.entity_id).filter(Boolean))] as string[];

    const [surveys, entities] = await Promise.all([
      surveyIds.length > 0
        ? ctx.services.central.fetchResources('surveys', {
            filter: { id: surveyIds },
            columns: ['id', 'code', 'name'],
            pageSize: 'ALL',
          })
        : [],
      entityIds.length > 0 ? models.entity.findManyById(entityIds) : [],
    ]);

    // Create lookup maps for O(1) access
    const surveyMap = new Map<string, { id: string; code: string; name: string }>(
      surveys.map((s: any) => [s.id, s]),
    );
    const entityMap = new Map(entities.map(e => [e.id, e]));

    // Filter out drafts for surveys the user no longer has permission to access
    const permittedDrafts = paginatedDrafts.filter(d => surveyMap.has(d.survey_id as string));

    // Batch fetch country entities by country_code for country name lookup
    const countryCodes = [
      ...new Set(
        permittedDrafts
          .map(d => (d.country_code as string) ?? entityMap.get(d.entity_id as string)?.country_code)
          .filter(Boolean),
      ),
    ] as string[];
    const countryEntities =
      countryCodes.length > 0
        ? await models.entity.find({ code: countryCodes, type: EntityTypeEnum.country })
        : [];
    const countryMap = new Map(countryEntities.map(c => [c.code, c.name]));

    const items = permittedDrafts.map(draft => {
      const survey = draft.survey_id ? surveyMap.get(draft.survey_id as string) : null;
      const entity = draft.entity_id ? entityMap.get(draft.entity_id as string) : null;
      const countryCode = (draft.country_code as string) ?? entity?.country_code ?? null;

      return {
        id: draft.id,
        surveyId: draft.survey_id,
        surveyCode: survey?.code ?? null,
        surveyName: survey?.name ?? null,
        countryCode,
        countryName: countryCode ? countryMap.get(countryCode) ?? null : null,
        entityId: draft.entity_id ?? null,
        entityName: entity?.name ?? null,
        startTime: draft.start_time ?? null,
        formData: draft.form_data,
        screenNumber: draft.screen_number,
        updatedAt: draft.updated_at,
      };
    });

    return {
      items,
      hasMorePages,
      pageNumber: page,
    } as DatatrakWebSurveyResponseDraftsRequest.ResBody;
  }
}
