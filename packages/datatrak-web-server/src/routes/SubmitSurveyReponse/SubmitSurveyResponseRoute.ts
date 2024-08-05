/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import {
  DatatrakWebSubmitSurveyResponseRequest as RequestT,
  MeditrakSurveyResponseRequest,
} from '@tupaia/types';
import { processSurveyResponse } from './processSurveyResponse';
import { addRecentEntities } from '../../utils';
import { DatatrakWebServerModelRegistry } from '../../types';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';

export type SubmitSurveyResponseRequest = Request<
  RequestT.Params,
  RequestT.ResBody,
  RequestT.ReqBody,
  RequestT.ReqQuery
>;
const findTasksToComplete = async (
  models: DatatrakWebServerModelRegistry,
  surveyResponse: MeditrakSurveyResponseRequest,
) => {
  const { survey_id: surveyId, entity_id: entityId, data_time: dataTime } = surveyResponse;
  return models.task.find({
    // only fetch tasks that have a status of 'to_do' or null (repeating tasks have a status of null)
    // @ts-ignore
    status: 'to_do',
    [QUERY_CONJUNCTIONS.OR]: {
      status: {
        comparator: 'IS',
        comparisonValue: null,
      },
    },
    [QUERY_CONJUNCTIONS.RAW]: {
      sql: `(survey_id = ? AND entity_id = ? AND created_at <= ?)`,
      parameters: [surveyId, entityId, dataTime],
    },
  });
};

export class SubmitSurveyResponseRoute extends Route<SubmitSurveyResponseRequest> {
  public async buildResponse() {
    const surveyResponseData = this.req.body;
    const { central: centralApi } = this.req.ctx.services;
    const { session, models } = this.req;

    const { qr_codes_to_create, recent_entities, ...processedResponse } =
      await processSurveyResponse(models, surveyResponseData);

    const response = await centralApi.createSurveyResponse(
      processedResponse,
      // If the user is not logged in, submit the survey response as public
      processedResponse.user_id ? undefined : { submitAsPublic: true },
    );

    const result = response?.results[0];
    const tasksToComplete = await findTasksToComplete(models, processedResponse);

    if (tasksToComplete.length > 0) {
      for (const task of tasksToComplete) {
        await task.handleCompletion(result.surveyResponseId);
        await task.addComment(
          'Completed this task',
          processedResponse.user_id!,
          models.taskComment.types.System,
        );
      }
    }

    // If the user is logged in, add the entities they answered to their recent entities list
    if (!!session && processedResponse.user_id) {
      const { user_id: userId } = processedResponse;
      // add these after the survey response has been submitted because we want to be able to add newly created entities to the recent entities list
      await addRecentEntities(models, userId, recent_entities);
    }

    return {
      qrCodeEntitiesCreated: qr_codes_to_create || [],
    };
  }
}
