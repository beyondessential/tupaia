/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { createUpsertEntityObjects } from '../utils/createUpsertEntityObjects';

export type SubmitSurveyRequest = Request<
  Record<string, never>,
  void,
  {
    entity_id: string;
    survey_id: string;
    data_time: string;
    timestamp: string;
    timezone: string;
    start_time: string;
    answers: Record<string, string>;
    entities_upserted: Record<string, string>;
  }
>;

const surveysEndpoint = 'surveys';

export class SubmitSurveyRoute extends Route<SubmitSurveyRequest> {
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;

    const {
      entity_id,
      data_time,
      start_time,
      survey_id,
      timestamp,
      answers,
      timezone,
      entities_upserted,
    } = this.req.body;

    const upsertEntityObjects = await createUpsertEntityObjects(
      // @ts-ignore
      this.req.models,
      // @ts-ignore
      entities_upserted,
      answers,
    );
    console.log('upsertEntityObjects', upsertEntityObjects);

    return;

    // return centralApi.createSurveyResponses([
    //   {
    //     survey_id: surveyId,
    //     start_time: startTime,
    //     entity_id: entityId,
    //     data_time: dataTime,
    //     end_time: timestamp,
    //     timestamp,
    //     timezone,
    //     // @ts-ignore
    //     answers,
    //     entities_upserted: upsertEntityObjects,
    //   },
    // ]);
  }
}
