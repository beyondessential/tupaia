/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
// @ts-nocheck
import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSubmitSurveyRequest as RequestT } from '@tupaia/types';
import { createUpsertEntityObjects } from '../utils/createUpsertEntityObjects';
import camelcaseKeys from 'camelcase-keys';
import { processSurveyResponse } from '../utils';

export type SubmitSurveyRequest = Request<RequestT.Params, RequestT.ResBody, RequestT.ReqBody, any>;

const columns = [
  'id',
  'question_id',
  'config',
  'question.name',
  'question.code',
  'question.text',
  'question.name',
  'question.type',
];

export class SubmitSurveyRoute extends Route<SubmitSurveyRequest> {
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;
    const surveyResponseData = this.req.body;
    const { answers, entities_upserted, country_id, survey_id } = surveyResponseData;

    const questions = camelcaseKeys(
      await this.req.ctx.services.central.fetchResources(
        `surveys/59085fb6cc42a44705c02d18/surveyScreenComponents`,
        {
          columns,
        },
      ),
    );

    console.log('questions', questions);

    const processedResponse = processSurveyResponse();

    const upsertEntityObjects = await createUpsertEntityObjects(
      this.req.models,
      entities_upserted,
      answers,
      country_id,
    );

    return true;

    // return centralApi.createSurveyResponses([
    //   {
    //     ...surveyResponseData,
    //     entities_upserted: upsertEntityObjects,
    //   },
    // ]);
  }
}
